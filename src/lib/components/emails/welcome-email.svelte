<script lang="ts">
  import {
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Img,
    Body,
  } from "svelte-email-tailwind";

  const preview = "Correo de Bienvenida e Información del Casillero";

  let {
    nombre,
    apellido,
    casillero,
    sucursal,
    codigo_de_compania,
    nombre_de_compania,
    logo,
  } = $props();

  let direccion = {
    direccion1: "7854 NW 46TH ST UNIT 2",
    estado: "FLORIDA",
    ciudad: "MIAMI",
    zip: "33166-5461",
    pais: "UNITED STATES",
    tel: "+1 786-622-1058",
  };

  const fontFamily =
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';

  const main = {
    backgroundColor: "#ffffff",
  };

  const container = {
    "max-width": "50em",
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "100%",
  };

  const heading = {
    fontFamily,
    fontSize: "24px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#484848",
  };

  const heading2 = {
    fontFamily,
    fontSize: "20px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#484848",
  };

  const paragraph = {
    fontFamily,
    fontSize: "18px",
    lineHeight: "1.4",
    color: "#484848",
  };

  const hr = {
    borderColor: "#cccccc",
    margin: "20px 0",
  };

  const logoIcon = {
    width: "17rem",
    height: "auto",
  };

  const logoContainer = {
    display: "flex",
    width: "fit-content",
    margin: "0 auto",
  };

  const footerTitle = {
    ...paragraph,
    fontSize: "16px",
  };

  const footerText = {
    ...paragraph,
    fontSize: "14px",
  };
</script>

<Html>
  <Head />
  <Preview {preview} />
  <Body>
    <Section style={main}>
      <Container style={container}>
        <Container style={logoContainer}>
          <Img src={logo} width="30" height="30" style={logoIcon} alt="Logo" />
        </Container>
        <Heading style={heading}
          >Bienvenido a {nombre_de_compania} ({codigo_de_compania})!</Heading
        >
        <Text style={paragraph}>
          Bienvenido {nombre},
        </Text>
        <Text style={paragraph}>
          Te haz registrado exitosamente en la sucursal {sucursal} ({codigo_de_compania}).
          Espero que te encuentres muy bien. Nuestra empresa esta enfocada a
          satisfacer las necesidades de nuestros clientes, brindándoles un
          servicio de alta calidad, personalizado y eficiente. Nuestra compañía
          brinda sus servicios de transporte de carga aérea y marítima con
          vuelos diarios y consolidaciones marítimas semanales de Miami a
          Panamá. Debajo encontraras la informacion de tu casillero.
        </Text>
        <Hr style={hr} />
        <Heading style={heading2}>Información del Casillero (Aéreo)</Heading>
        <Text style={paragraph}>
          Nombre: {codigo_de_compania}
          {nombre}
          {apellido}
          <br />
          Address Line 1: {direccion.direccion1}
          {codigo_de_compania}
          <br />
          Address Line 2: {codigo_de_compania}{casillero}
          <br />
          City: {direccion.ciudad}
          <br />
          State: {direccion.estado}
          <br />
          Zip Code: {direccion.zip}
          <br />
          Country: {direccion.pais}
          <br />
          Tel: {direccion.tel}
        </Text>
        <Text style={paragraph}>
          Usa esta información cada vez que realizes una compra por internet.
          Recuerda que debes
          <strong
            >incluir su casillero ({codigo_de_compania}{casillero}) en la
            dirección!</strong
          >
          Sin el número de casillero no podremos rastrear su paquete cuando llegue
          a Panamá. Para informarte más de como realizar tus compras, contactanos.
        </Text>
        <Text style={paragraph}
          ><strong
            >Atención: Esta dirección es para compras aéreas, sí deseas la
            dirección para compras marítimas, contactanos para más información.</strong
          ></Text
        >
        <Hr style={hr} />
        <Text style={footerTitle}>
          Para nosotros es un placer poder realizarles la siguiente propuesta:
        </Text>
        <ul>
          <li>
            <Text style={footerText}>
              En caso de solicitar asegurar su mercancía de alto valor
              (OPCIONAL) se le cobrara el 20% del valor total de su factura
              comercial previo aviso. (Adjuntar factura comercial).
            </Text>
          </li>
          <li>
            <Text style={footerText}>
              En caso de pérdida nos haremos responsable al 100 % una vez el
              cliente tenga asegurada su mercancía una vez se tenga la certeza
              con firma incluida de uno de nuestros colaboradores en la bodega
              en Miami. De lo contrario solo nos haremos responsables por el 25%
              del valor y contamos con 8 días hábiles para realizar las
              averiguaciones pertinentes, una vez se tenga la certeza con firma
              incluida de uno de nuestros colaboradores en la bodega en Miami.
            </Text>
          </li>
          <li>
            <Text style={footerText}>
              NO nos hacemos responsables por carga entregada por USPS puesto
              que no tenemos seguridad de entrega.
            </Text>
          </li>
          <li>
            <Text style={footerText}>
              NO nos hacemos responsable por daño en mercancía mal empacada por
              exportación.
            </Text>
          </li>
          <li>
            <Text style={footerText}>
              NO nos haremos responsable por paquetes después de 1 mes de no ser
              retirado de la oficina.
            </Text>
          </li>
        </ul>
      </Container>
    </Section>
  </Body>
</Html>
