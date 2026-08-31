import os
import glob
import re
import json
import csv
from html import unescape

def parse_hold_score(score_str):
    """
    Parses climbing score strings like 'TOP', '49+', '37', '28+' into structured numeric values.
    """
    if not score_str:
        return {'raw': '', 'holds': None, 'isPlus': False, 'isTop': False, 'numericValue': None}
    
    score_clean = score_str.strip().upper()
    is_top = 'TOP' in score_clean
    is_plus = '+' in score_clean
    
    if is_top:
        return {'raw': score_str, 'holds': None, 'isPlus': False, 'isTop': True, 'numericValue': 999.0}
    
    hold_m = re.search(r'(\d+)', score_clean)
    if hold_m:
        holds = int(hold_m.group(1))
        # In climbing statistics, '+' is often represented as +0.5 for continuous analysis
        numeric_val = holds + 0.5 if is_plus else float(holds)
        return {'raw': score_str, 'holds': holds, 'isPlus': is_plus, 'isTop': False, 'numericValue': numeric_val}
        
    return {'raw': score_str, 'holds': None, 'isPlus': is_plus, 'isTop': is_top, 'numericValue': None}

def parse_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()

    # Event info
    event_m = re.search(r'class=[\"\'][^\"\']*event-name[^\"\']*[\"\']>\s*([^<]+)\s*<', html)
    cat_m = re.search(r'class=[\"\'][^\"\']*dcat-row(?!\s*event-name)[^\"\']*[\"\']>\s*([^<]+)\s*<', html)
    if not cat_m:
        all_dcat = re.findall(r'class=[\"\'][^\"\']*dcat-row[^\"\']*[\"\']>\s*([^<]+)\s*<', html)
        if len(all_dcat) > 1:
            cat_m_val = all_dcat[1].strip()
        else:
            cat_m_val = all_dcat[0].strip() if all_dcat else "Unknown Category"
    else:
        cat_m_val = cat_m.group(1).strip()
    round_m = re.search(r'class=[\"\'][^\"\']*round-name[^\"\']*[\"\']>\s*([^<]+)\s*<', html)

    event_name = unescape(event_m.group(1).strip()) if event_m else "Unknown Event"
    category = unescape(cat_m_val)
    round_name = unescape(round_m.group(1).strip()) if round_m else "Unknown Round"

    # Split rows
    row_matches = re.findall(r'<tr[^>]*class=[\"\'][^\"\']*r-row[^\"\']*[\"\'][^>]*>(.*?)</tr>', html, re.DOTALL)
    
    athletes = []
    for row in row_matches:
        # Rank
        rank_m = re.search(r'class=[\"\'][^\"\']*rank[^\"\']*[\"\']>([^<]+)<', row)
        rank = rank_m.group(1).strip() if rank_m else ""

        # Name & Athlete ID
        athlete_link_m = re.search(r'href=[\"\'][^\"\']*/athlete/(\d+)[\"\'][^>]*class=[\"\'][^\"\']*r-name[^\"\']*[\"\']>\s*([^<]+?)\s*<', row)
        if athlete_link_m:
            athlete_id = athlete_link_m.group(1)
            name = unescape(athlete_link_m.group(2).strip())
        else:
            name_m = re.search(r'class=[\"\'][^\"\']*r-name[^\"\']*[\"\']>\s*([^<]+?)\s*<', row)
            name = unescape(name_m.group(1).strip()) if name_m else "Unknown"
            athlete_id = ""

        # Sub info from .r-name-sub
        sub_block_m = re.search(r'class=[\"\'][^\"\']*r-name-sub[^\"\']*[\"\']>(.*?)</div>', row, re.DOTALL)
        bib = ""
        country = ""
        if sub_block_m:
            sub_content = sub_block_m.group(1)
            country_m = re.search(r'>([A-Z]{3})\s*<!', sub_content)
            if not country_m:
                country_m = re.search(r'\b([A-Z]{3})\b', sub_content)
            if country_m:
                country = country_m.group(1)
            
            bib_m = re.search(r'>(\d+)\s*<span', sub_content)
            if not bib_m:
                bib_m = re.search(r'\b(\d+)\b', sub_content)
            if bib_m:
                bib = bib_m.group(1)

        # Score cell
        score_cell_m = re.search(r'class=[\"\'][^\"\']*r-score[^\"\']*[\"\'][^>]*>(.*)', row, re.DOTALL)
        score_cell = score_cell_m.group(1) if score_cell_m else ""

        # Main score (in qualification: points e.g. 10.51; in finals: holds e.g. 51+)
        main_score_m = re.search(r'<div[^>]*class=[\"\'][^\"\']*text-center[^\"\']*[\"\']>\s*<span[^>]*>\s*([^<]+)\s*</span>', score_cell)
        if not main_score_m:
            main_score_m = re.search(r'<span[^>]*>\s*([0-9\.\+TOPtop]+)\s*</span>', score_cell)
        score_val = unescape(main_score_m.group(1).strip()) if main_score_m else ""

        # Lead routes if present (e.g. R1, R2 in qualifications)
        route_blocks = re.findall(
            r'<div[^>]*class=[\"\'][^\"\']*px-2[^\"\']*[\"\'][^>]*>'
            r'.*?<div[^>]*class=[\"\'][^\"\']*text-center[^\"\']*[\"\']>\s*([^<]+?)\s*(?:<span[^>]*>\s*\(([^)]+)\)\s*</span>)?\s*</div>'
            r'.*?<div[^>]*class=[\"\'][^\"\']*lead-route-name[^\"\']*[\"\']>\s*([^<]+)\s*</div>',
            score_cell,
            re.DOTALL
        )
        
        routes = []
        for r_score, r_rank, r_name in route_blocks:
            parsed_hold = parse_hold_score(unescape(r_score.strip()))
            routes.append({
                'route': unescape(r_name.strip()),
                'scoreRaw': unescape(r_score.strip()),
                'holds': parsed_hold['holds'],
                'isPlus': parsed_hold['isPlus'],
                'isTop': parsed_hold['isTop'],
                'numericValue': parsed_hold['numericValue'],
                'rankInRoute': int(unescape(r_rank.strip())) if (r_rank and r_rank.strip().isdigit()) else (unescape(r_rank.strip()) if r_rank else None)
            })

        # Final hold analysis (if it's a finals round, main score is hold count e.g. '51+')
        final_hold_parsed = parse_hold_score(score_val) if round_name.lower() == 'final' else None

        # Qualification total rank points
        qual_rank_points = None
        if round_name.lower() != 'final':
            try:
                qual_rank_points = float(score_val)
            except (ValueError, TypeError):
                pass

        athletes.append({
            'rank': int(rank) if rank.isdigit() else rank,
            'name': name,
            'athleteId': athlete_id,
            'bib': int(bib) if bib.isdigit() else bib,
            'country': country,
            'scoreRaw': score_val,
            'qualRankPoints': qual_rank_points,
            'finalHold': final_hold_parsed,
            'routes': routes
        })

    return {
        'fileName': os.path.basename(file_path),
        'event': event_name,
        'category': category,
        'round': round_name,
        'athleteCount': len(athletes),
        'athletes': athletes
    }

def export_csv_for_file(comp_data, csv_path):
    round_name = comp_data['round']
    is_final = round_name.lower() == 'final' or 'final' in os.path.basename(csv_path).lower()
    
    rows = []
    if is_final:
        fieldnames = ['Name', 'Rank', 'Final Points']
        for a in comp_data['athletes']:
            final_pts = ''
            if a['finalHold']:
                final_pts = 'TOP' if a['finalHold']['isTop'] else a['finalHold']['numericValue']
            rows.append({
                'Name': a['name'],
                'Rank': a['rank'],
                'Final Points': final_pts
            })
    else:
        fieldnames = ['Name', 'Rank', 'R1 Points', 'R1 Rank', 'R2 Points', 'R2 Rank']
        for a in comp_data['athletes']:
            r1_pts = ''
            r1_rank = None
            r2_pts = ''
            r2_rank = None
            for r in a['routes']:
                if r['route'] == 'R1':
                    r1_pts = 'TOP' if r['isTop'] else r['numericValue']
                    r1_rank = r['rankInRoute'] if r['rankInRoute'] is not None else None
                elif r['route'] == 'R2':
                    r2_pts = 'TOP' if r['isTop'] else r['numericValue']
                    r2_rank = r['rankInRoute'] if r['rankInRoute'] is not None else None
            
            calc_rank = ''
            if r1_rank is not None and r2_rank is not None:
                import math
                val = math.sqrt(float(r1_rank) * float(r2_rank))
                rounded = round(val, 2)
                calc_rank = int(rounded) if rounded.is_integer() else rounded
            else:
                calc_rank = a['rank']
                
            rows.append({
                'Name': a['name'],
                'Rank': calc_rank,
                'R1 Points': r1_pts,
                'R1 Rank': r1_rank if r1_rank is not None else '',
                'R2 Points': r2_pts,
                'R2 Rank': r2_rank if r2_rank is not None else ''
            })
            
        def sort_key(row):
            try:
                return (float(row['Rank']), row['Name'])
            except (ValueError, TypeError):
                return (9999, row['Name'])
        rows.sort(key=sort_key)

    if rows:
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

def main():
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'comp data')
    out_dir = os.path.join(base_dir, 'extracted')
    os.makedirs(out_dir, exist_ok=True)
    
    html_files = sorted(glob.glob(os.path.join(base_dir, '*.html')))
    
    for hf in html_files:
        data = parse_html_file(hf)
        base_name = os.path.splitext(os.path.basename(hf))[0]
        csv_path = os.path.join(out_dir, f"{base_name}.csv")
        export_csv_for_file(data, csv_path)
        print(f"Generated CSV: {csv_path}")

if __name__ == '__main__':
    main()
