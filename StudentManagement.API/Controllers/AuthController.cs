using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public AuthController(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var email = request.Username.Trim().ToLower();
        if (await _context.UserAccounts.AnyAsync(u => u.Username.ToLower() == email))
            return BadRequest(new { error = "This email is already registered!" });

        var user = new UserAccount
        {
            Username = email,
            PasswordHash = HashPassword(request.Password.Trim()),
            FullName = request.FullName.Trim(),
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Teacher" : request.Role
        };

        _context.UserAccounts.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Registration successful!", role = user.Role });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var email = request.Username.Trim().ToLower();
        var hash = HashPassword(request.Password.Trim());

        var user = await _context.UserAccounts
            .FirstOrDefaultAsync(u => u.Username.ToLower() == email && u.PasswordHash == hash);

        if (user == null)
            return Unauthorized(new { error = "Incorrect email or password!" });

        return Ok(new
        {
            username = user.Username,
            fullName = user.FullName,
            role = user.Role
        });
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            using var http = new HttpClient();
            var response = await http.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={request.Credential}");
            if (!response.IsSuccessStatusCode)
                return Unauthorized(new { error = "Invalid Google token." });

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            string email = (root.GetProperty("email").GetString() ?? "").Trim().ToLower();
            string name = root.TryGetProperty("name", out var n) ? (n.GetString() ?? "UNIT Member") : "UNIT Member";

            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username.ToLower() == email);
            if (user == null)
            {
                user = new UserAccount
                {
                    Username = email,
                    FullName = name,
                    PasswordHash = HashPassword(Guid.NewGuid().ToString()),
                    Role = string.IsNullOrWhiteSpace(request.SelectedRole) ? "Teacher" : request.SelectedRole
                };
                _context.UserAccounts.Add(user);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                username = user.Username,
                fullName = user.FullName,
                role = user.Role
            });
        }
        catch (Exception ex)
        {
            return Unauthorized(new { error = "Google authentication failed: " + ex.Message });
        }
    }

    [HttpPost("send-student-email")]
    public async Task<IActionResult> SendEmailToStudent([FromBody] SendEmailRequest req)
    {
        try
        {
            string htmlBody = $@"
                <div style='font-family: Inter, Arial, sans-serif; padding: 24px; color: #0F172A; line-height: 1.6; border: 1px solid #E2E8F0; border-radius: 12px;'>
                    <h2 style='color: #12387D; margin-bottom: 12px;'>UNIT University - Academic Notification</h2>
                    <p>Dear Student,</p>
                    <div style='background: #F8FAFC; border-left: 4px solid #2563EB; padding: 16px; margin: 16px 0;'>
                        {req.Message}
                    </div>
                    <p style='font-size: 13px; color: #475569;'>Best regards,<br><strong>Office of Academic Affairs - UNIT University</strong></p>
                </div>";

            await _emailService.SendEmailAsync(req.ToEmail, req.Subject, htmlBody);
            return Ok(new { message = $"Notification email successfully sent to {req.ToEmail}" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "Email delivery failed: " + ex.Message });
        }
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}

public record LoginRequest(string Username, string Password);
public record RegisterRequest(string Username, string Password, string FullName, string Role);
public record GoogleLoginRequest(string Credential, string? SelectedRole);
public record SendEmailRequest(string ToEmail, string Subject, string Message);