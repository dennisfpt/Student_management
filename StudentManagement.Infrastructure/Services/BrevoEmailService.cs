using System.Net.Http.Json;
using StudentManagement.Application.Interfaces;

namespace StudentManagement.Infrastructure.Services;

public class BrevoEmailService : IEmailService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public BrevoEmailService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var apiKey = Environment.GetEnvironmentVariable("BREVO_API_KEY");
        var senderEmail = Environment.GetEnvironmentVariable("SENDER_EMAIL");

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(senderEmail))
        {
            throw new InvalidOperationException("BREVO_API_KEY or SENDER_EMAIL is not configured in environment variables.");
        }

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("api-key", apiKey);

        var payload = new
        {
            sender = new { name = "Unit University SIMS", email = senderEmail },
            to = new[] { new { email = toEmail } },
            subject,
            htmlContent = htmlBody
        };

        var response = await client.PostAsJsonAsync("https://api.brevo.com/v3/smtp/email", payload);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new Exception($"Brevo API ({(int)response.StatusCode}): {err}");
        }
    }
}