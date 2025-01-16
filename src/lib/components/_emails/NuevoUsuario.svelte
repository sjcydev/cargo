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
    Link,
  } from "svelte-email";

  const preview = "Información del usuario";
  export let nombre: String;
  export let username: String;
  export let password: String;

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

  const note = {
    ...paragraph,
    fontSize: "14px",
    "font-style": "italic",
  };

  const hr = {
    borderColor: "#cccccc",
    margin: "20px 0",
  };
</script>

<Html>
  <Head />
  <Preview {preview} />
  <Section style={main}>
    <Container style={container}>
      <Heading style={heading}>Introducción al Sistema de Facturación</Heading>
      <Text style={paragraph}>
        Hola {nombre},
      </Text>
      <Text style={paragraph}>
        Aqui encontraras las instrucciones y detalles de la cuenta para poder
        iniciar sesión en el sistema de facturación.
      </Text>
      <Text style={paragraph}>
        El sistema de facturación se encuentra en este enlace <Link
          href="https://admin.panaboxlogistics.com/"
          >https://admin.panaboxlogistics.com/</Link
        >. Al entrar al enlace, te mandara a iniciar sesión. Usa los detalles de
        la cuenta que se encuentra en la sección de abajo.
      </Text>
      <Hr style={hr} />
      <Heading style={heading2}>Información de la Cuenta del Usuario</Heading>
      <Text style={paragraph}>
        Nombre de Usuario: {username}
        <br />
        Contraseña: {password}
      </Text>
      <Text style={paragraph}>
        Al iniciar sesión, te mandara a crear una nueva contraseña ya que la
        contraseña en este correo es temporal. Una vez que cambies la
        contraseña, entrarás al sistema y podrás comenzar a facturar a tus
        clientes.
      </Text>
      <Text style={note}>
        Si deseas crear mas cuentas para otros ayudantes, contacte al tecnico o
        al administrador.
      </Text>
    </Container>
  </Section>
</Html>
