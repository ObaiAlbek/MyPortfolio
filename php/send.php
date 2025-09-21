<?php
// php/send.php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . 'vendor/autoload.php';

header('Content-Type: application/json; charset=UTF-8');

try {
  // ENV laden (SMTP-Daten außerhalb des Codes)
  $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
  $dotenv->safeLoad();

  // Nur POST zulassen
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
  }

  // Honeypot (Bot check)
  if (!empty($_POST['website'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Spam detected']);
    exit;
  }

  // Daten einsammeln & validieren
  $name    = trim((string)($_POST['name'] ?? ''));
  $email   = trim((string)($_POST['email'] ?? ''));
  $message = trim((string)($_POST['message'] ?? ''));

  if (mb_strlen($name) < 2)   throw new Exception('Bitte einen gültigen Namen eingeben.');
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception('Bitte eine gültige E-Mail angeben.');
  if (mb_strlen($message) < 10) throw new Exception('Nachricht ist zu kurz.');

  // Mailer konfigurieren
  $mail = new PHPMailer(true);
  $mail->isSMTP();
  $mail->Host       = $_ENV['SMTP_HOST']      ?? 'smtp.example.com';
  $mail->SMTPAuth   = true;
  $mail->Username   = $_ENV['SMTP_USER']      ?? 'user@example.com';
  $mail->Password   = $_ENV['SMTP_PASS']      ?? 'secret';
  $mail->Port       = (int)($_ENV['SMTP_PORT'] ?? 587);
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

  // Absender & Empfänger
  // Wichtig: setFrom sollte eine Domain nutzen, die zu deinem SMTP passt.
  $fromEmail = $_ENV['MAIL_FROM']      ?? 'no-reply@deine-domain.de';
  $fromName  = $_ENV['MAIL_FROM_NAME'] ?? 'Portfolio Kontakt';
  $toEmail   = $_ENV['MAIL_TO']        ?? 'ich@deine-domain.de';

  $mail->setFrom($fromEmail, $fromName);
  $mail->addAddress($toEmail, 'Obai Albek');
  $mail->addReplyTo($email, $name); // Antworten gehen an den Absender

  // Inhalt
  $mail->isHTML(true);
  $mail->Subject = 'Neue Nachricht über das Kontaktformular';
  $body = sprintf('<h2>Neue Nachricht</h2>
    <p><strong>Name:</strong> %s</p>
    <p><strong>E-Mail:</strong> %s</p>
    <p><strong>Nachricht:</strong><br>%s</p>
    <hr>
    <small>IP: %s &middot; %s</small>',
    htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
    htmlspecialchars($email, ENT_QUOTES, 'UTF-8'),
    nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')),
    $_SERVER['REMOTE_ADDR'] ?? 'n/a',
    date('Y-m-d H:i:s')
  );
  $mail->Body    = $body;
  $mail->AltBody = "Neue Nachricht\n\nName: $name\nE-Mail: $email\n\n$message";

  // Senden
  $mail->send();

  echo json_encode(['ok' => true]);
} catch (Exception $e) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
