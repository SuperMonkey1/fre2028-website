const getWelcomeEmailTemplate = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
      
      <h2 style="color: #333; margin-bottom: 20px;">Welkom bij FRE2028</h2>
      
      <p style="color: #333; margin-bottom: 15px;">
        Jij bent vanaf nu een echte Fréddy!.
      </p>

      <p style="color: #333; margin-bottom: 15px;">
        Bedankt voor je inschrijving op mijn nieuwsbrief over doelen bereiken, de Paralympische Spelen en mijn persoonlijke reis richting 2028.
      </p>
      
      <p style="color: #666; font-size: 10px; margin-top: 15px;">
        Uitschrijven kan door mij een email te sturen.<br>
      </p>

      <p style="color: #333; margin-top: 20px;">
        Ambitieuze groetjes,<br>
        Fré
      </p>
    
      
    </div>
  `;
};

const EMAIL_SUBJECTS = {
  WELCOME: 'Welkom bij FRE2028 nieuwsbrief',
  // Add other email subjects here as needed
};

module.exports = {
  getWelcomeEmailTemplate,
  EMAIL_SUBJECTS
};
