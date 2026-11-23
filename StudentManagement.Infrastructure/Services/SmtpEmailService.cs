using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using StudentManagement.Application.Interfaces;

namespace StudentManagement.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public SmtpEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
    {
        var host = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
        var port = int.TryParse(_configuration["Email:SmtpPort"], out var p) ? p : 587;
        var senderEmail = _configuration["Email:SenderEmail"]
            ?? throw new InvalidOperationException("Missing Email:SenderEmail configuration.");
        var appPassword = _configuration["Email:AppPassword"]
            ?? throw new InvalidOperationException("Missing Email:AppPassword configuration.");
        var senderName = _configuration["Email:SenderName"] ?? "UIT Unit University SIMS";

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(senderEmail, appPassword),
            EnableSsl = true
        };

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail, senderName),
            Subject = subject,
            Body = htmlMessage,
            IsBodyHtml = true
        };
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }
}