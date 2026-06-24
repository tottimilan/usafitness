export interface Company {
  razonSocial: string;
  nif: string;
  direccionPostal: string;
  emailLegal: string;
  telefonoLegal: string;
  lastUpdated: string;
}

export interface LegalStore {
  name: string;
  location: string;
  domain: string;
  slug: string;
}

export interface LegalDocMeta {
  slug: string;
  label: string;
}

export const LEGAL_DOCS: LegalDocMeta[] = [
  { slug: 'aviso-legal', label: 'Aviso Legal' },
  { slug: 'politica-de-privacidad', label: 'Política de Privacidad' },
  { slug: 'politica-de-cookies', label: 'Política de Cookies' },
  { slug: 'politica-redes-sociales', label: 'Política de Privacidad Redes Sociales' },
];

export function isLegalDoc(slug: string | undefined): boolean {
  return !!slug && LEGAL_DOCS.some((d) => d.slug === slug);
}

function ownerTable(c: Company, url: string): string {
  return `
    <table class="legal-table">
      <tbody>
        <tr><th>Razón social</th><td>${c.razonSocial}</td></tr>
        <tr><th>NIF</th><td>${c.nif}</td></tr>
        <tr><th>Dominio</th><td>${url}</td></tr>
        <tr><th>Dirección postal</th><td>${c.direccionPostal}</td></tr>
        <tr><th>Dirección electrónica</th><td><a href="mailto:${c.emailLegal}">${c.emailLegal}</a></td></tr>
        <tr><th>Teléfono</th><td>${c.telefonoLegal}</td></tr>
      </tbody>
    </table>`;
}

function avisoLegal(c: Company, url: string): string {
  return `
    <h3>Introducción</h3>
    <p>En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), ${c.razonSocial} informa que es titular del sitio web. De acuerdo con la exigencia del artículo 10 de la citada Ley, ${c.razonSocial} informa de los siguientes datos:</p>
    ${ownerTable(c, url)}
    <h3>Usuario y régimen de responsabilidades</h3>
    <p>La navegación, acceso y uso por el sitio web de ${c.razonSocial} confiere la condición de usuario. El sitio web de ${c.razonSocial} proporciona gran diversidad de información, servicios y datos. El usuario asume su responsabilidad en el uso correcto del sitio web. Esta responsabilidad se extenderá a:</p>
    <ul>
      <li>La veracidad y licitud de las informaciones aportadas por el usuario en los formularios extendidos por ${c.razonSocial} para el acceso a ciertos contenidos o servicios ofrecidos por el web.</li>
      <li>El uso de la información, servicios y datos ofrecidos por ${c.razonSocial} contrariamente a lo dispuesto por las presentes condiciones, la Ley, la moral, las buenas costumbres o el orden público, o que de cualquier otro modo puedan suponer lesión de los derechos de terceros o del mismo funcionamiento del sitio web.</li>
    </ul>
    <h3>Política de enlaces y exenciones de responsabilidad</h3>
    <p>${c.razonSocial} no se hace responsable del contenido de los sitios web a los que el usuario pueda acceder a través de los enlaces establecidos en su sitio web, siempre que no tenga conocimiento efectivo de que la actividad o la información a la que remite o recomienda es ilícita o de que lesiona bienes o derechos de un tercero susceptibles de indemnización, o, en caso de tenerlo, actúe con diligencia para suprimir o inutilizar el enlace correspondiente.</p>
    <p>${c.razonSocial} declara haber adoptado todas las medidas necesarias para evitar cualquier daño a los usuarios de su sitio web, que pudieran derivarse de la navegación por su sitio web. En consecuencia, ${c.razonSocial} no se hace responsable, en ningún caso, de los eventuales daños que por la navegación por Internet pudiera sufrir el usuario.</p>
    <h3>Modificaciones</h3>
    <p>${c.razonSocial} se reserva la facultad de efectuar, en cualquier momento y sin necesidad de previo aviso, modificaciones y actualizaciones de la información contenida en su sitio web o en la configuración y presentación de esta.</p>
    <h3>Indicación de precios</h3>
    <p>En caso de que se muestren precios de productos y/o servicios, los indicados en pantalla serán los vigentes en cada momento. Los precios serán indicados en euros y tendrán incorporado el Impuesto sobre el Valor Añadido (IVA). En caso de que no se incorpore el IVA en el precio, se indicará de manera expresa y se permitirá al usuario visualizar el precio final completo.</p>
    <h3>Propiedad intelectual e industrial</h3>
    <p>${c.razonSocial} por sí misma o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.). Quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta página web, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de ${c.razonSocial}.</p>
    <h3>Acciones legales, legislación aplicable y jurisdicción</h3>
    <p>Si el usuario desea presentar una reclamación, deberá contactar mediante el correo electrónico <a href="mailto:${c.emailLegal}">${c.emailLegal}</a>. Asimismo, ${c.razonSocial} dispone de hojas oficiales de reclamación a disposición de los consumidores y usuarios. La relación entre el usuario y el prestador se regirá por la normativa vigente y de aplicación en el territorio español.</p>`;
}

function politicaPrivacidad(c: Company, url: string): string {
  return `
    <h3>Datos del propietario de la web</h3>
    ${ownerTable(c, url)}
    <h3>Protección de datos</h3>
    <p>De conformidad con la normativa vigente y aplicable en protección de datos de carácter personal, le informamos que sus datos serán incorporados al sistema de tratamiento titularidad de ${c.razonSocial} con NIF ${c.nif} y domicilio social sito en ${c.direccionPostal}. A continuación, se facilita la información de los tratamientos realizados:</p>
    <h3>Tratamientos realizados</h3>
    <ul>
      <li><strong>Gestión usuarios web.</strong> Finalidad: captación, registro y tratamiento de datos del usuario. Plazo de conservación: mientras se mantenga el consentimiento prestado, salvo obligación legal. Base legítima: el consentimiento del interesado. Datos básicos: nombre y apellidos, dirección electrónica.</li>
      <li><strong>Acciones comerciales formulario web.</strong> Finalidad: captación, registro y tratamiento de datos con finalidades de atender sus consultas y/o solicitudes, así como de publicidad y prospección comercial. Plazo de conservación: mientras se mantenga el consentimiento prestado, salvo obligación legal. Base legítima: el consentimiento del interesado. Datos básicos: nombre y apellidos, dirección electrónica.</li>
      <li><strong>Newsletter.</strong> Finalidad: gestión de la suscripción a la newsletter, para realizar los envíos correspondientes. Plazo de conservación: mientras se mantenga el consentimiento prestado. Base legítima: el consentimiento del interesado. Datos básicos: nombre y apellidos, dirección electrónica.</li>
      <li><strong>Instalación de cookies.</strong> Finalidad: gestión e instalación de las cookies. Plazo de conservación: mientras se mantenga el consentimiento prestado. Base legítima: el consentimiento del interesado. Datos básicos: dirección electrónica, dirección IP.</li>
      <li><strong>Gestión formulario web.</strong> Finalidad: atender sus consultas y/o solicitudes. Plazo de conservación: mientras se mantenga el consentimiento prestado. Base legítima: el consentimiento del interesado. Datos básicos: nombre y apellidos, dirección electrónica, dirección IP.</li>
    </ul>
    <h3>Derechos de los interesados</h3>
    <p>${c.razonSocial} informa a los Usuarios que podrá ejercer los derechos de acceso, rectificación, limitación, supresión, portabilidad, oposición al tratamiento de sus datos de carácter personal y el derecho a no ser objeto de decisiones automatizadas, incluida la elaboración de perfiles, ante el Responsable del Tratamiento, así como a la retirada del consentimiento prestado.</p>
    <ul>
      <li><strong>Derecho de Acceso:</strong> obtener confirmación sobre si se están tratando sus datos y, en tal caso, los concretos datos personales tratados y la información legal del tratamiento.</li>
      <li><strong>Derecho de Rectificación:</strong> que se modifiquen los datos que resulten ser inexactos o incompletos.</li>
      <li><strong>Derecho a la Limitación de tratamiento:</strong> que se limiten los fines del tratamiento previstos de forma original por el responsable.</li>
      <li><strong>Derecho de Supresión:</strong> suprimir los datos de carácter personal del usuario, a excepción de lo previsto en el propio RGPD.</li>
      <li><strong>Derecho a la Portabilidad:</strong> recibir los datos personales facilitados en un formato estructurado, de uso común y lectura mecánica.</li>
      <li><strong>Derecho de Oposición:</strong> que no se lleve a cabo el tratamiento de sus datos o se cese el mismo.</li>
      <li><strong>Derecho a no ser objeto de decisiones automatizadas,</strong> incluida la elaboración de perfiles.</li>
      <li><strong>Derecho a retirar el consentimiento</strong> en cualquier momento y de manera gratuita.</li>
    </ul>
    <p>Para ejercer cualquiera de los derechos descritos deberá presentar un escrito a la dirección ${c.direccionPostal} (a la atención de ${c.razonSocial}) o bien a través de correo electrónico a <a href="mailto:${c.emailLegal}">${c.emailLegal}</a>, identificándose fehacientemente y concretando la solicitud. Por último, le informamos que tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos en caso de que considere que un hecho pueda suponer un incumplimiento de la normativa aplicable en materia de protección de datos.</p>`;
}

function politicaCookies(c: Company, url: string): string {
  return `
    <p>Conforme a lo dispuesto en el artículo 22.2 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE) vigente, ${c.razonSocial} cumple con la obligación de informar sobre las cookies que utiliza y sus finalidades.</p>
    <p>Este sitio web utiliza cookies y/o tecnologías similares que almacenan y recuperan información cuando navegas. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un Usuario o de su equipo y, dependiendo de la información que contenga y de la forma en que utilice su equipo, pueden utilizarse para reconocer al Usuario. Las cookies son esenciales para el funcionamiento de internet, facilitándole al Usuario la navegación y usabilidad de nuestra web.</p>
    <h3>Tipos de cookies</h3>
    <p><strong>Según la entidad que las gestione:</strong></p>
    <ul>
      <li><strong>Cookies propias:</strong> se envían al equipo terminal del usuario desde un equipo o dominio gestionado por el propio editor y desde el que se presta el servicio solicitado.</li>
      <li><strong>Cookies de tercero:</strong> se envían al equipo terminal del usuario desde un equipo o dominio que no es gestionado por el editor, sino por otra entidad que trata los datos obtenidos.</li>
    </ul>
    <p><strong>Según el plazo de tiempo que permanezcan activadas:</strong></p>
    <ul>
      <li><strong>Cookies de sesión:</strong> recaban y almacenan datos mientras el usuario accede a una página web y desaparecen al terminar la sesión.</li>
      <li><strong>Cookies persistentes:</strong> los datos siguen almacenados en el terminal y pueden ser accedidos y tratados durante un periodo definido por el responsable de la cookie.</li>
    </ul>
    <p><strong>Según su finalidad:</strong></p>
    <ul>
      <li><strong>Cookies técnicas:</strong> permiten al usuario la navegación a través de una página web y la utilización de las diferentes opciones o servicios que en ella existan.</li>
      <li><strong>Cookies de personalización:</strong> permiten aplicar características propias para la navegación del usuario por el website (ej. idioma).</li>
      <li><strong>Cookies de análisis:</strong> permiten el seguimiento y análisis del comportamiento de los usuarios de los sitios web a los que están vinculadas.</li>
      <li><strong>Cookies publicitarias:</strong> permiten al editor incluir en la página web espacios publicitarios según el contenido de la propia web.</li>
      <li><strong>Cookies de publicidad comportamental:</strong> almacenan información del comportamiento de los usuarios obtenida a través de la observación continuada de sus hábitos de navegación.</li>
    </ul>
    <h3>Gestión de cookies en el navegador</h3>
    <p>Puede usted permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador:</p>
    <ul>
      <li><a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-" target="_blank" rel="noopener noreferrer">Firefox</a></li>
      <li><a href="http://support.google.com/chrome/bin/answer.py?hl=es&answer=95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
      <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
      <li><a href="https://support.apple.com/kb/ph17191?locale=es_ES" target="_blank" rel="noopener noreferrer">Safari</a></li>
      <li><a href="https://help.opera.com/en/latest/web-preferences/#cookies" target="_blank" rel="noopener noreferrer">Opera</a></li>
    </ul>
    <p>Para conocer más información sobre el tratamiento de datos personales, le recomendamos visitar nuestro apartado «Política de Privacidad».</p>`;
}

function politicaRedesSociales(c: Company, url: string): string {
  return `
    <p>La presente Política de Privacidad de Redes Sociales regula el tratamiento de los datos de carácter personal de los usuarios que sigan, interactúen o se hagan seguidores de los perfiles oficiales de ${c.razonSocial} en las redes sociales.</p>
    <h3>Responsable del tratamiento</h3>
    ${ownerTable(c, url)}
    <h3>Finalidad y legitimación</h3>
    <p>${c.razonSocial} tratará los datos de los usuarios con la finalidad de gestionar correctamente su presencia en la red social, informar de sus actividades, productos o servicios, así como para cualquier otra finalidad que las normativas de las redes sociales permitan. La base de legitimación del tratamiento es el consentimiento del interesado, prestado al solicitar voluntariamente seguir o interactuar con nuestros perfiles.</p>
    <p>Al hacerse seguidor o interactuar con los perfiles de ${c.razonSocial}, usted consiente el tratamiento de aquellos datos personales publicados en su perfil de la red social. El tratamiento de los datos dentro de cada red social se regirá, además, por las políticas de privacidad y condiciones de uso de la propia red social, por lo que recomendamos su lectura.</p>
    <h3>Datos tratados y conservación</h3>
    <p>${c.razonSocial} podrá tratar los datos que el usuario haga públicos en la red social, así como la información derivada de su interacción (comentarios, «me gusta», mensajes, etc.). Los datos se conservarán mientras el usuario mantenga el vínculo con el perfil (seguidor, contacto o similar) y no solicite su supresión.</p>
    <h3>Derechos de los interesados</h3>
    <p>El usuario podrá ejercer los derechos de acceso, rectificación, limitación, supresión, portabilidad y oposición al tratamiento de sus datos, así como retirar el consentimiento prestado, dirigiendo su petición a la dirección ${c.direccionPostal} o al correo electrónico <a href="mailto:${c.emailLegal}">${c.emailLegal}</a>. Determinados derechos, como la rectificación o supresión de información publicada, sólo podrán satisfacerse en relación con aquellos contenidos que se encuentren bajo el control de ${c.razonSocial}. Asimismo, podrá presentar una reclamación ante la Agencia Española de Protección de Datos.</p>`;
}

export function getLegalDoc(
  docSlug: string,
  c: Company,
  store: LegalStore
): { title: string; html: string } | null {
  const url = `https://${store.domain}`;
  const meta = LEGAL_DOCS.find((d) => d.slug === docSlug);
  if (!meta) return null;

  let body = '';
  switch (docSlug) {
    case 'aviso-legal':
      body = avisoLegal(c, url);
      break;
    case 'politica-de-privacidad':
      body = politicaPrivacidad(c, url);
      break;
    case 'politica-de-cookies':
      body = politicaCookies(c, url);
      break;
    case 'politica-redes-sociales':
      body = politicaRedesSociales(c, url);
      break;
    default:
      return null;
  }

  const html = `${body}<p class="legal-updated">Última actualización: ${c.lastUpdated}</p>`;
  return { title: meta.label, html };
}
