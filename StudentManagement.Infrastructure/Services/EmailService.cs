using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using StudentManagement.Application.Interfaces;

namespace StudentManagement.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
    {
        var senderEmail = _config["EmailSettings:SenderEmail"] ?? "noreply@unit.edu.vn";
        var appPassword = _config["EmailSettings:AppPassword"] ?? "";
        var host = _config["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
        var port = int.Parse(_config["EmailSettings:Port"] ?? "587");

        if (string.IsNullOrWhiteSpace(appPassword))
        {
            // Giả lập gửi thành công khi chưa cấu hình AppPassword SMTP thật
            await Task.CompletedTask;
            return;
        }

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(senderEmail, appPassword),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail, "UNIT University SIMS"),
            Subject = subject,
            Body = htmlMessage,
            IsBodyHtml = true
        };
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }
}