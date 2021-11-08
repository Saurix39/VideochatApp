# VideoChat App
En este repositorio se encuntra el codigo correspondiente a una aplicación web que utiliza webRTC para lograr la comunicación entre dos pares para el intercambio de video, este desarrollo tiene la intencion de asemejarse a los servicios de video chat tradicionales como zoom o google meet.

## Aspectos a tener en cuenta
* Para que el software funcione se debe usar un servidor de peer en el puerto 3001 por defecto, para esto anteriormente debio instalar peerjs de manera global y posterior a ello ejecutar el siguiente comando: **peerjs --port 3001**
Este comando para correr el servidor en dicho puerto.
* Se utiliza mongoose para interactuar con una base de datos en MongoDB la cual contiente tanto información del usuario como la de acceso a las salas.
* El formulario de login funciona como formulario de registro.