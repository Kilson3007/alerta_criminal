const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = 'AIzaSyC49zs6uRdbycl2_IiBXBuR1WAZ1vFw0l0';

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Olá, quem é você?');
    console.log('Resposta Gemini:', result.response.text());
  } catch (error) {
    console.error('Erro ao consultar Gemini:', error);
  }
}

testGemini(); 