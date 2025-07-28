
require('dotenv').config();
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

const client = new Client({ connectionString });

const userId = 'bb3d0c75-27fb-47d9-9ce3-d821f861fb0b';

const faqsToSeed = [
  {
    question: 'Qual é a política de privacidade da plataforma?',
    answer: 'Nossa política de privacidade detalha como coletamos, usamos e protegemos seus dados. Você pode encontrá-la na seção "Privacidade" do nosso site.',
    category: 'Segurança',
    tags: ['privacidade', 'dados', 'segurança'],
    is_active: true,
    created_by: userId,
  },
  {
    question: 'Como posso alterar meu e-mail de cadastro?',
    answer: 'Para alterar seu e-mail, acesse as configurações do seu perfil e procure pela opção "Alterar E-mail". Siga as instruções para confirmar a alteração.',
    category: 'Conta',
    tags: ['perfil', 'email', 'cadastro'],
    is_active: true,
    created_by: userId,
  },
  {
    question: 'A plataforma oferece integração com outras ferramentas?',
    answer: 'Sim, oferecemos integrações com várias ferramentas populares. Visite nossa seção de "Integrações" para ver a lista completa e os guias de configuração.',
    category: 'Integrações',
    tags: ['integração', 'api', 'ferramentas'],
    is_active: true,
    created_by: userId,
  },
  {
    question: 'Como funciona o período de teste gratuito?',
    answer: 'Oferecemos um período de teste de 14 dias com acesso a todos os recursos. Não é necessário cartão de crédito para iniciar o teste.',
    category: 'Assinatura',
    tags: ['teste', 'gratuito', 'assinatura'],
    is_active: true,
    created_by: userId,
  },
  {
    question: 'Quais são os requisitos de sistema para usar a plataforma?',
    answer: 'A plataforma é baseada na web e funciona na maioria dos navegadores modernos. Recomendamos o uso do Google Chrome ou Mozilla Firefox para a melhor experiência.',
    category: 'Técnico',
    tags: ['requisitos', 'sistema', 'navegador'],
    is_active: true,
    created_by: userId,
  },
  {
    question: 'Como posso exportar meus dados?',
    answer: 'Você pode exportar seus dados em formato CSV ou JSON a partir do painel de configurações da sua conta, na seção "Exportação de Dados".',
    category: 'Dados',
    tags: ['exportar', 'dados', 'backup'],
    is_active: false,
    created_by: userId,
  }
];

async function seedWithPostgres() {
  await client.connect();

  console.log('Connected to Postgres. Seeding FAQs...');

  for (const faq of faqsToSeed) {
    const query = {
      text: 'INSERT INTO faq_items(question, answer, category, tags, is_active, created_by) VALUES($1, $2, $3, $4, $5, $6)',
      values: [faq.question, faq.answer, faq.category, faq.tags, faq.is_active, faq.created_by],
    };

    try {
      await client.query(query);
    } catch (err) {
      console.error('Error inserting FAQ:', err.stack);
    }
  }

  console.log('Finished seeding FAQs.');
  await client.end();
}

seedWithPostgres();
