import os
import glob
import csv
import re
import math

def convert_score_to_points(score_str):
    if score_str is None or score_str == '':
        return ''
    score_clean = str(score_str).strip().upper()
    if 'TOP' in score_clean:
        return 'TOP'
    
    # If it's already a numeric value (e.g. 37.5, 37.0, 37)
    try:
        val = float(score_clean)
        return int(val) if val.is_integer() else val
    except ValueError:
        pass
    
    is_plus = '+' in score_clean
    hold_m = re.search(r'(\d+)', score_clean)
    if hold_m:
        val = int(hold_m.group(1))
        return val + 0.5 if is_plus else val
    
    return score_str

def parse_numeric_score(val):
    if val is None or val == '':
        return 0.0
    val_str = str(val).strip().upper()
    if 'TOP' in val_str:
        return 999.0
    try:
        return float(val_str)
    except ValueError:
        pass
    is_plus = '+' in val_str
    m = re.search(r'(\d+)', val_str)
    if m:
        num = float(m.group(1))
        return num + 0.5 if is_plus else num
    return 0.0

def calculate_fractional_ranks(scores):
    """
    Given a list of numeric hold scores (higher is better),
    computes the official IFSC fractional rank for each competitor.
    Tied competitors occupy positions [start_pos, ..., end_pos]
    and each receives the average position: (start_pos + ... + end_pos) / count.
    """
    indexed = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
    ranks = [0.0] * len(scores)
    
    i = 0
    while i < len(indexed):
        j = i
        while j < len(indexed) and indexed[j][1] == indexed[i][1]:
            j += 1
        
        # Positions are 1-indexed: (i + 1) to j
        count = j - i
        sum_positions = sum(range(i + 1, j + 1))
        avg_rank = sum_positions / count
        
        for k in range(i, j):
            orig_idx = indexed[k][0]
            ranks[orig_idx] = avg_rank
            
        i = j
        
    return ranks

def clean_csv_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if not rows:
        return

    is_final = any(r.get('Round', '').lower() == 'final' for r in rows) or 'final' in os.path.basename(file_path).lower()
    
    cleaned_rows = []
    
    if is_final:
        out_fields = ['Name', 'Rank', 'Final Points']
        for r in rows:
            raw_score = r.get('FinalHoldRaw') or r.get('OverallScore') or r.get('Final Points') or r.get('FinalHoldNumeric') or ''
            pts = convert_score_to_points(raw_score)
            if not pts and r.get('FinalHoldNumeric'):
                pts = convert_score_to_points(r.get('FinalHoldNumeric'))
                
            rank = r.get('Rank', '').strip()
            try:
                rank_num = float(rank)
                rank = int(rank_num) if rank_num.is_integer() else rank
            except ValueError:
                pass
                
            name = r.get('Name', '').strip()
            
            cleaned_rows.append({
                'Name': name,
                'Rank': rank,
                'Final Points': pts
            })
    else:
        out_fields = ['Name', 'Rank', 'IFSC Score', 'R1 Points', 'R1 Rank', 'R2 Points', 'R2 Rank']
        
        # Collect raw athlete data
        athletes = []
        for r in rows:
            name = r.get('Name', '').strip()
            
            r1_raw = r.get('R1_ScoreRaw') or r.get('R1 Points') or r.get('R1_Numeric') or ''
            r1_pts = convert_score_to_points(r1_raw)
            if not r1_pts and r.get('R1_Numeric'):
                r1_pts = convert_score_to_points(r.get('R1_Numeric'))
                
            r2_raw = r.get('R2_ScoreRaw') or r.get('R2 Points') or r.get('R2_Numeric') or ''
            r2_pts = convert_score_to_points(r2_raw)
            if not r2_pts and r.get('R2_Numeric'):
                r2_pts = convert_score_to_points(r.get('R2_Numeric'))
                
            athletes.append({
                'Name': name,
                'r1_pts': r1_pts,
                'r2_pts': r2_pts,
                'r1_num': parse_numeric_score(r1_pts),
                'r2_num': parse_numeric_score(r2_pts)
            })
            
        # Compute official IFSC Fractional Ranks for Route 1 and Route 2
        r1_ranks = calculate_fractional_ranks([a['r1_num'] for a in athletes])
        r2_ranks = calculate_fractional_ranks([a['r2_num'] for a in athletes])
        
        for idx, a in enumerate(athletes):
            p1 = r1_ranks[idx]
            p2 = r2_ranks[idx]
            qp = math.sqrt(p1 * p2)
            
            a['p1'] = p1
            a['p2'] = p2
            a['qp'] = qp
            
        # Sort athletes by Qualification Points (QP) ascending, tie-breaker by name
        athletes.sort(key=lambda a: (a['qp'], a['Name']))
        
        # Assign official Overall Qualification Rank (handling QP ties)
        for idx, a in enumerate(athletes):
            if idx > 0 and math.isclose(a['qp'], athletes[idx - 1]['qp'], rel_tol=1e-4):
                a['overall_rank'] = athletes[idx - 1]['overall_rank']
            else:
                a['overall_rank'] = idx + 1
                
            # Format numbers cleanly
            p1_fmt = int(a['p1']) if a['p1'].is_integer() else round(a['p1'], 2)
            p2_fmt = int(a['p2']) if a['p2'].is_integer() else round(a['p2'], 2)
            qp_val = round(a['qp'], 3)
            qp_fmt = int(qp_val) if qp_val.is_integer() else qp_val
            
            cleaned_rows.append({
                'Name': a['Name'],
                'Rank': a['overall_rank'],
                'IFSC Score': qp_fmt,
                'R1 Points': a['r1_pts'],
                'R1 Rank': p1_fmt,
                'R2 Points': a['r2_pts'],
                'R2 Rank': p2_fmt
            })

    with open(file_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=out_fields)
        writer.writeheader()
        writer.writerows(cleaned_rows)
        
    print(f"Cleaned: {file_path} ({len(cleaned_rows)} rows)")

def main():
    extracted_dir = os.path.join(os.path.dirname(__file__), '..', 'comp data', 'extracted')
    csv_files = sorted(glob.glob(os.path.join(extracted_dir, '*.csv')))
    
    for cf in csv_files:
        clean_csv_file(cf)

if __name__ == '__main__':
    main()
