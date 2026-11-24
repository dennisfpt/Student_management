using System.Security.Cryptography;
using System.Text;
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
    public async Task<IActionResult> Register([FromBody] PortalRegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new { message = "Please fill in Full Name, Email, and Password." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        if (await _context.UserAccounts.AnyAsync(u => u.Username.ToLower() == email))
        {
            return BadRequest(new { message = "This email is already registered!" });
        }

        var role = string.IsNullOrWhiteSpace(request.Role) ? "Student" : request.Role.Trim();
        var major = string.IsNullOrWhiteSpace(request.Major) ? "Information Technology" : request.Major.Trim();

        var assignedCode = !string.IsNullOrWhiteSpace(request.UserCode)
            ? request.UserCode.Trim()
            : role.Equals("Teacher", StringComparison.OrdinalIgnoreCase)
                ? $"GV{(await _context.Teachers.CountAsync() + 1):D3}"
                : $"SV26{(await _context.Students.CountAsync() + 1):D3}";

        var account = new UserAccount
        {
            Username = email,
            PasswordHash = HashPassword(request.Password.Trim()),
            FullName = request.FullName.Trim(),
            Role = role
        };
        _context.UserAccounts.Add(account);

        if (role.Equals("Teacher", StringComparison.OrdinalIgnoreCase))
        {
            _context.Teachers.Add(new Teacher
            {
                Id = assignedCode,
                FullName = request.FullName.Trim(),
                Email = email,
                Department = major,
                PhoneNumber = string.IsNullOrWhiteSpace(request.Phone) ? "0901234567" : request.Phone.Trim()
            });
        }
        else
        {
            _context.Students.Add(new Student
            {
                Id = assignedCode,
                FullName = request.FullName.Trim(),
                Email = email,
                DateOfBirth = new DateTime(2006, 5, 15, 0, 0, 0, DateTimeKind.Utc),
                Gpa = 0
            });

            _context.StudentProfiles.Add(new StudentProfile
            {
                Email = email,
                StudentId = assignedCode,
                FullName = request.FullName.Trim(),
                Phone = string.IsNullOrWhiteSpace(request.Phone) ? "0901234567" : request.Phone.Trim(),
                Major = major
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Account registered successfully!",
            email,
            fullName = account.FullName,
            role = account.Role,
            userCode = assignedCode,
            major
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] PortalLoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var hash = HashPassword(request.Password.Trim());

        var user = await _context.UserAccounts
            .FirstOrDefaultAsync(u => u.Username.ToLower() == email && u.PasswordHash == hash);

        if (user == null)
        {
            return Unauthorized(new { message = "Incorrect email or password!" });
        }

        var student = await _context.Students.FirstOrDefaultAsync(s => s.Email.ToLower() == email);
        var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.Email.ToLower() == email);
        var profile = await _context.StudentProfiles.FirstOrDefaultAsync(p => p.Email.ToLower() == email);

        var userCode = student?.Id ?? teacher?.Id ?? "";
        var major = profile?.Major ?? teacher?.Department ?? (student != null ? "Information Technology" : "");

        return Ok(new
        {
            email = user.Username,
            fullName = user.FullName,
            role = user.Role,
            userCode,
            major
        });
    }

    [HttpPost("send-student-email")]
    public async Task<IActionResult> SendEmailToStudent([FromBody] SendNotificationEmailRequest req)
    {
        try
        {
            var safeMessage = System.Net.WebUtility.HtmlEncode(req.Message);
            var htmlBody = $@"
                <div style='font-family: Inter, Arial, sans-serif; padding: 24px; color: #0F172A; line-height: 1.6; border: 1px solid #E2E8F0; border-radius: 12px;'>
                    <h2 style='color: #12387D; margin-bottom: 12px;'>UNIT University - Academic Notification</h2>
                    <p>Dear Student,</p>
                    <div style='background: #F8FAFC; border-left: 4px solid #2563EB; padding: 16px; margin: 16px 0; white-space: pre-line;'>
                        {safeMessage}
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
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }
}

public record PortalRegisterRequest(
    string FullName,
    string Email,
    string Password,
    string? Role,
    string? UserCode,
    string? Phone,
    string? Major);

public record PortalLoginRequest(string Email, string Password);
public record SendNotificationEmailRequest(string ToEmail, string Subject, string Message);