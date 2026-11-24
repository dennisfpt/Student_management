using System.Net.Http.Json;
using StudentManagement.Application.Interfaces;

namespace StudentManagement.Infrastructure.Services;

public class BrevoEmailService : IEmailService
{
    private static readonly HttpClient _httpClient = new();

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var apiKey = Environment.GetEnvironmentVariable("BREVO_API_KEY");
        var senderEmail = Environment.GetEnvironmentVariable("SENDER_EMAIL");

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(senderEmail))
        {
            throw new InvalidOperationException("BREVO_API_KEY or SENDER_EMAIL is not configured in environment variables.");
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
        request.Headers.Add("api-key", apiKey);
        request.Content = JsonContent.Create(new
        {
            sender = new { name = "Unit University SIMS", email = senderEmail },
            to = new[] { new { email = toEmail } },
            subject,
            htmlContent = htmlBody
        });

        using var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new Exception($"Brevo API ({(int)response.StatusCode}): {err}");
        }
    }
}