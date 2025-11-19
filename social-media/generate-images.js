const puppeteer = require('puppeteer');
const path = require('path');

async function generateImage(filename, width, height) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width, height, deviceScaleFactor: 2 }); // 2x for retina
  const filePath = `file://${path.join(__dirname, filename)}`;
  
  console.log(`📸 Generating ${filename}...`);
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  // Wait a bit for fonts to load
  await page.waitForTimeout(500);
  
  const outputName = filename.replace('.html', '.png');
  await page.screenshot({ 
    path: outputName,
    fullPage: false,
    type: 'png'
  });
  
  await browser.close();
  console.log(`✅ Generated: ${outputName} (${width}x${height}px)`);
}

(async () => {
  console.log('🚀 Starting social media image generation...\n');
  
  try {
    await generateImage('instagram-post.html', 1080, 1080);
    await generateImage('instagram-story.html', 1080, 1920);
    await generateImage('linkedin-post.html', 1200, 627);
    await generateImage('facebook-post.html', 1200, 630);
    
    console.log('\n🎉 All images generated successfully!');
    console.log('📁 Images saved in: public/social-media/');
  } catch (error) {
    console.error('❌ Error generating images:', error);
    process.exit(1);
  }
})();
