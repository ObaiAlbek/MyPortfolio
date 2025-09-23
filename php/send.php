
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

// JSON-Antwort vorbereiten
header('Content-Type: application/json; charset=utf-8');

try {
    // Optionaler Honeypot: <input id="website" name="website">
    if (!empty($_POST['website'] ?? '')) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Spam erkannt.']);
        exit;
    }

    // Felder aus deinem Formular
    $first = trim($_POST['firstName'] ?? '');
    $last  = trim($_POST['lastName']  ?? '');
    $email = trim($_POST['email']     ?? '');
    $subj  = trim($_POST['subject']   ?? '');
    $msg   = trim($_POST['message']   ?? '');

    // Minimale Validierung
    if (mb_strlen($first) < 2 || mb_strlen($last) < 2) {
        throw new Exception('Bitte gib einen gültigen Namen an.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Bitte gib eine gültige E-Mail an.');
    }
    if (mb_strlen($subj) < 3) {
        throw new Exception('Betreff ist zu kurz.');
    }
    if (mb_strlen($msg) < 10) {
        throw new Exception('Nachricht bitte mit mindestens 10 Zeichen.');
    }

    $name = $first . ' ' . $last;

    $mail = new PHPMailer(true);

    // --- SMTP (Gmail) ---
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'obay.albeek@gmail.com';    // DEINE Gmail-Adresse
    $mail->Password   = 'ehcdqxkdnqghkyqk';         // 16-stelliges App-Passwort
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

        // Absender & Empfänger
        $mail->setFrom($email, $name);
        $mail->addAddress('obay.albeek@gmail.com');   // wohin die Nachricht geht (du selbst)

       // --- Inhalt ---
    $safeName  = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $safeSubj  = htmlspecialchars($subj, ENT_QUOTES, 'UTF-8');
    $safeMsg   = nl2br(htmlspecialchars($msg, ENT_QUOTES, 'UTF-8'));

    $mail->Subject = 'Neue Kontaktanfrage: ' . $safeSubj;
    $mail->isHTML(true);
    $mail->Body = "
        <h2>Neue Kontaktanfrage</h2>
        <p><strong>Name:</strong> {$safeName}</p>
        <p><strong>E-Mail:</strong> {$safeEmail}</p>
        <p><strong>Betreff:</strong> {$safeSubj}</p>
        <hr>
        <p>{$safeMsg}</p>
    ";
    $mail->AltBody = "Neue Kontaktanfrage\n\nName: {$name}\nE-Mail: {$email}\nBetreff: {$subj}\n\n{$msg}";

    $mail->send();
    header("Location: ../html/thanks.html");

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>