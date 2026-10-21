/* Configuração comercial do site (edite aqui; nada é enviado a lugar nenhum além do link que o usuário clicar).
   checkoutUrl : link de afiliado/checkout. Se vazio, o botão de compra abre o WhatsApp com a receita do pack pronta.
   whatsapp    : número com DDI+DDD, só dígitos (ex.: "5511999999999"). Vazio = o usuário escolhe o contato.
   ctaExtra    : complemento do botão (ex.: "com Montagem Gratuita"). Só preencha se a oferta for real e vigente.
   partnerEmail / partnerWhatsapp : contatos comerciais da Área de Parceiros B2B (e-mail e número com DDI+DDD, só dígitos).
   partnerFormUrl : endereço que RECEBE o cadastro de parceiros (ex.: Formspree, Getform, Web3Forms, Apps Script). O site é estático e não tem servidor:
                    sem este endereço o formulário não consegue entregar nada por conta própria (cai no e-mail/WhatsApp, e a mensagem de sucesso só aparece com confirmação real).
   partnerFormExtra : campos fixos enviados junto (ex.: { access_key: '...' } do Web3Forms).
   partnerSla : prazo prometido na mensagem de sucesso (ex.: "24 horas"). Só preencha se for um compromisso real; vazio = "em breve". */
window.MW_CONFIG = window.MW_CONFIG || { checkoutUrl: '', whatsapp: '', ctaExtra: '', partnerEmail: '', partnerWhatsapp: '', partnerFormUrl: '', partnerFormExtra: {}, partnerSla: '' };
