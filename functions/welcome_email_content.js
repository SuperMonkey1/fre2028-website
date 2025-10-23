const getWelcomeEmailTemplate = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
      
      <h2 style="color: #333; margin-bottom: 20px;">Welkom!</h2>
      
      <p style="color: #333; margin-bottom: 15px;">
        Bedankt voor je inschrijving op mijn nieuwsbrief. Ik neem je graag mee in mijn wereld van doelen bereiken, de Paralympische Spelen en mijn persoonlijke reis richting 2028.
      </p>

      <p style="color: #333; margin-bottom: 15px;">
        Heb je een vorige editie gemist? Geen probleem! Je kunt alle voorgaande nieuwsbrieven hier nalezen: <a href="https://www.teamfre.be/" style="color: #0056b3; text-decoration: underline;">https://www.teamfre.be/</a>
      </p>
      
      <p style="color: #666; font-size: 10px; margin-top: 15px;">
        Mocht je je willen uitschrijven, dan kan dat eenvoudig via de link onderaan deze e-mail.
      </p>

      <p style="color: #333; margin-top: 20px;">
        Ambitieuze groetjes,<br>
        Fré
      </p>
    
      
    </div>
  `;
};

const EMAIL_SUBJECTS = {
  WELCOME: 'Welkom bij FRE2028 nieuwsbrief', // Het onderwerp is ongewijzigd gelaten
  // Add other email subjects here as needed
};

module.exports = {
  getWelcomeEmailTemplate,
  EMAIL_SUBJECTS
};