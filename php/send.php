<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

if (isset($_POST["send"])) {
    $name    = $_POST["name"];
    $email   = $_POST["email"];
    $message = $_POST["message"];

    $mail = new PHPMailer(true);

    try {
        // Server Einstellungen
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'obay.albeek@gmail.com';   // deine Gmail-Adresse
        $mail->Password   = 'ehcdqxkdnqghkyqk';        // DEIN 16-stelliges App-Passwort (ohne Leerzeichen)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';

        // Absender & Empfänger
        $mail->setFrom($email, $name);
        $mail->addAddress('obay.albeek@gmail.com');   // wohin die Nachricht geht (du selbst)

        // Inhalt
        $mail->isHTML(true);
        $mail->Body    = $message;
        $mail->send();
        header("Location: ../html/thanks.html");
    } catch (Exception $e) {
        echo $e;
       
    }
}
?>