using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AcademicController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public AcademicController(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    private async Task WriteAuditAsync(string actor, string action, string target, string detail)
    {
        _context.AuditLogs.Add(new AuditLog
        {
            Id = "LOG-" + DateTime.UtcNow.ToString("HHmmssfff"),
            Actor = actor,
            Action = action,
            Target = target,
            Detail = detail,
            Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
        });
        await _context.SaveChangesAsync();
    }

    // GET: api/Academic/state?email=...
    [HttpGet("state")]
    public async Task<IActionResult> GetState([FromQuery] string? email)
    {
        var students = await _context.Students.AsNoTracking().ToListAsync();
        var teachers = await _context.Teachers.AsNoTracking().ToListAsync();
        var classes = await _context.ClassSections.AsNoTracking().ToListAsync();
        var courses = await _context.Courses.AsNoTracking().ToListAsync();
        var profiles = await _context.StudentProfiles.AsNoTracking().ToListAsync();
        var invoices = await _context.TuitionInvoices.AsNoTracking().ToListAsync();
        var announcements = await _context.Announcements.AsNoTracking().ToListAsync();
        var tickets = await _context.SupportTickets.AsNoTracking().ToListAsync();
        var assignments = await _context.PortalAssignments.AsNoTracking().ToListAsync();
        var attendance = await _context.AttendanceSummaries.AsNoTracking().ToListAsync();
        var scholarships = await _context.ScholarshipAwards.AsNoTracking().ToListAsync();
        var events = await _context.CampusEvents.AsNoTracking().ToListAsync();
        var auditLogs = await _context.AuditLogs.AsNoTracking().OrderByDescending(l => l.Timestamp).Take(250).ToListAsync();

        var studentRec = !string.IsNullOrWhiteSpace(email)
            ? students.FirstOrDefault(s => s.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
            : null;

        var profile = !string.IsNullOrWhiteSpace(email)
            ? profiles.FirstOrDefault(p => p.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
            : null;

        profile ??= new StudentProfile
        {
            Email = email ?? "an.nv@unit.edu.vn",
            StudentId = studentRec?.Id ?? "SV26001",
            FullName = studentRec?.FullName ?? "Nguyen Thi Mai",
            Major = "Information Technology"
        };

        return Ok(new
        {
            profile,
            students,
            teachers,
            classes,
            courses,
            invoices = invoices.Where(i =>
                i.StudentEmail == "ALL" ||
                (!string.IsNullOrWhiteSpace(email) && i.StudentEmail.Equals(email, StringComparison.OrdinalIgnoreCase))).ToList(),
            announcements,
            tickets = tickets.OrderByDescending(t => t.CreatedAt).ToList(),
            assignments,
            attendanceRecords = attendance,
            scholarships,
            events,
            auditLogs
        });
    }

    // POST: api/Academic/classes
    [HttpPost("classes")]
    public async Task<IActionResult> AddClass([FromBody] ClassSection request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Class name is required." });
        }

        request.Id = string.IsNullOrWhiteSpace(request.Id)
            ? "CLS-" + DateTime.UtcNow.ToString("MMdd-HHmm")
            : request.Id.Trim();
        request.MaxCapacity = request.MaxCapacity <= 0 || request.MaxCapacity > 30 ? 30 : request.MaxCapacity;
        request.Status = string.IsNullOrWhiteSpace(request.Status) ? "Active" : request.Status;

        _context.ClassSections.Add(request);
        await _context.SaveChangesAsync();
        await WriteAuditAsync("System Administrator", "CLASS_CREATE", request.Id, $"Created class {request.Name} ({request.Department}).");

        return Ok(request);
    }

    // POST: api/Academic/publish-tuition
    [HttpPost("publish-tuition")]
    public async Task<IActionResult> PublishTuition([FromBody] TuitionPublishRequest request)
    {
        var invoiceId = "INV-" + DateTime.UtcNow.ToString("yyyyMMdd-HHmmss");
        var createdAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        var invoice = new TuitionInvoice
        {
            Id = invoiceId,
            StudentEmail = string.IsNullOrWhiteSpace(request.StudentEmail) ? "ALL" : request.StudentEmail.Trim(),
            Semester = request.Semester,
            Credits = request.Credits,
            AmountVnd = request.AmountVnd,
            Note = request.Note,
            BankCode = "MB",
            AccountNo = "0865156242",
            AccountName = "DUONG THI KIM YEN",
            Paid = false,
            CreatedAt = createdAt,
            RecipientEmailsJson = JsonSerializer.Serialize(request.RecipientEmails ?? new List<string>())
        };
        _context.TuitionInvoices.Add(invoice);

        var title = $"Tuition Notice: {request.Semester}";
        _context.Announcements.Add(new Announcement
        {
            Id = "NOTIF-" + DateTime.UtcNow.ToString("HHmmss"),
            Category = "Tuition",
            TargetGroup = "Students",
            Title = title,
            Message = $"{request.Note} — Amount due: {request.AmountVnd:N0} VND.",
            InvoiceId = invoiceId,
            AmountVnd = request.AmountVnd,
            CreatedAt = createdAt
        });

        await _context.SaveChangesAsync();
        await WriteAuditAsync("System Administrator", "TUITION_PUBLISH", invoiceId, $"Issued tuition invoice {request.Semester} ({request.AmountVnd:N0} VND).");

        int emailsSent = 0;
        if (request.RecipientEmails != null)
        {
            var qrUrl = $"https://img.vietqr.io/image/MB-0865156242-compact2.png?amount={Math.Round(request.AmountVnd)}&addInfo={Uri.EscapeDataString(invoiceId)}&accountName={Uri.EscapeDataString("DUONG THI KIM YEN")}";
            var htmlBody = $"<h2>Unit University — Tuition Fee Notice</h2><p>Semester: <strong>{WebUtility.HtmlEncode(request.Semester)}</strong></p><p>Amount: <strong>{request.AmountVnd:N0} VND</strong></p><img src='{qrUrl}' width='220'/>";

            foreach (var mail in request.RecipientEmails.Where(e => !string.IsNullOrWhiteSpace(e)).Distinct())
            {
                try
                {
                    await _emailService.SendEmailAsync(mail.Trim(), $"[Unit University] {title}", htmlBody);
                    emailsSent++;
                }
                catch { }
            }
        }

        return Ok(new { invoice, emailsSent });
    }

    // POST: api/Academic/pay/{invoiceId}
    [HttpPost("pay/{invoiceId}")]
    public async Task<IActionResult> PayInvoice(string invoiceId)
    {
        var inv = await _context.TuitionInvoices.FirstOrDefaultAsync(i => i.Id == invoiceId);
        if (inv == null) return NotFound();

        inv.Paid = true;
        await _context.SaveChangesAsync();
        await WriteAuditAsync("Student Portal", "TUITION_PAID", invoiceId, $"Confirmed VietQR payment for invoice {invoiceId} ({inv.AmountVnd:N0} VND).");

        return Ok(inv);
    }

    // POST: api/Academic/tickets
    [HttpPost("tickets")]
    public async Task<IActionResult> CreateTicket([FromBody] SupportTicket request)
    {
        if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Description))
        {
            return BadRequest(new { message = "Please enter subject and description." });
        }

        request.Id = "REQ-" + DateTime.UtcNow.ToString("MMdd-HHmmss");
        request.Status = "Pending";
        request.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        _context.SupportTickets.Add(request);
        await _context.SaveChangesAsync();
        await WriteAuditAsync($"{request.StudentName} ({request.StudentId})", "SUPPORT_TICKET", request.Id, $"Opened ticket: {request.Subject}");

        return Ok(request);
    }

    // POST: api/Academic/reply-ticket
    [HttpPost("reply-ticket")]
    public async Task<IActionResult> ReplyTicket([FromBody] TicketReplyRequest request)
    {
        var ticket = await _context.SupportTickets.FirstOrDefaultAsync(t => t.Id == request.TicketId);
        if (ticket == null) return NotFound();

        ticket.Status = string.IsNullOrWhiteSpace(request.Status) ? "Resolved" : request.Status;
        ticket.AdminReply = request.AdminReply;
        ticket.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        _context.Announcements.Add(new Announcement
        {
            Id = "SUP-" + DateTime.UtcNow.ToString("HHmmss"),
            Category = "Support Reply",
            TargetGroup = ticket.StudentEmail,
            Title = $"Support Update ({ticket.Id}): {ticket.Subject}",
            Message = $"Status: {ticket.Status} — Admin Response: {ticket.AdminReply}",
            CreatedAt = ticket.UpdatedAt
        });

        await _context.SaveChangesAsync();
        await WriteAuditAsync("System Administrator", "SUPPORT_REPLY", ticket.Id, $"Replied to ticket {ticket.Id} ({ticket.Status}).");

        return Ok(ticket);
    }

    // POST: api/Academic/evaluate-scholarships
    [HttpPost("evaluate-scholarships")]
    public async Task<IActionResult> EvaluateScholarships()
    {
        var students = await _context.Students.AsNoTracking().OrderByDescending(s => s.Gpa).ToListAsync();
        var oldScholarships = await _context.ScholarshipAwards.ToListAsync();
        _context.ScholarshipAwards.RemoveRange(oldScholarships);

        var awarded = new List<ScholarshipAward>();
        var awardedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        foreach (var s in students)
        {
            if (s.Gpa >= 3.90)
            {
                awarded.Add(new ScholarshipAward
                {
                    StudentId = s.Id,
                    StudentName = s.FullName,
                    Major = "Information Technology",
                    ClassId = "IT-K26A1",
                    Gpa = s.Gpa,
                    Tier = "Full Presidential (100%)",
                    WaiverAmountVnd = 12500000,
                    AwardedAt = awardedAt
                });
            }
            else if (s.Gpa >= 3.78)
            {
                awarded.Add(new ScholarshipAward
                {
                    StudentId = s.Id,
                    StudentName = s.FullName,
                    Major = "Information Technology",
                    ClassId = "IT-K26A1",
                    Gpa = s.Gpa,
                    Tier = "Merit Excellence (50%)",
                    WaiverAmountVnd = 6250000,
                    AwardedAt = awardedAt
                });
            }
            else if (s.Gpa >= 3.65)
            {
                awarded.Add(new ScholarshipAward
                {
                    StudentId = s.Id,
                    StudentName = s.FullName,
                    Major = "Information Technology",
                    ClassId = "IT-K26A1",
                    Gpa = s.Gpa,
                    Tier = "Dean's Honor List (30%)",
                    WaiverAmountVnd = 3750000,
                    AwardedAt = awardedAt
                });
            }
        }

        _context.ScholarshipAwards.AddRange(awarded);
        await _context.SaveChangesAsync();
        await WriteAuditAsync("System Administrator", "SCHOLARSHIP_EVAL", "Students", $"Evaluated {students.Count} students; awarded {awarded.Count} scholarships.");

        return Ok(new { totalAwarded = awarded.Count, scholarships = awarded });
    }

    // POST: api/Academic/events
    [HttpPost("events")]
    public async Task<IActionResult> CreateEvent([FromBody] CampusEvent request)
    {
        if (string.IsNullOrWhiteSpace(request.Title)) return BadRequest();

        request.Id = "EVT-" + DateTime.UtcNow.ToString("MMdd-HHmm");
        request.Status = string.IsNullOrWhiteSpace(request.Status) ? "Upcoming" : request.Status;
        request.AttendeesJson = string.IsNullOrWhiteSpace(request.AttendeesJson) ? "[]" : request.AttendeesJson;

        _context.CampusEvents.Add(request);
        await _context.SaveChangesAsync();
        await WriteAuditAsync("System Administrator", "EVENT_CREATE", request.Id, $"Created event '{request.Title}'.");

        return Ok(request);
    }

    // POST: api/Academic/events/{eventId}/checkin
    [HttpPost("events/{eventId}/checkin")]
    public async Task<IActionResult> CheckInEvent(string eventId, [FromBody] EventCheckInRequest request)
    {
        var evt = await _context.CampusEvents.FirstOrDefaultAsync(e => e.Id == eventId);
        if (evt == null) return NotFound();

        var attendees = JsonSerializer.Deserialize<List<EventCheckInItem>>(evt.AttendeesJson) ?? new();
        if (attendees.Any(a => a.StudentId.Equals(request.StudentId, StringComparison.OrdinalIgnoreCase)))
        {
            return BadRequest(new { message = "You have already checked in for this event!" });
        }

        attendees.Insert(0, new EventCheckInItem
        {
            StudentId = request.StudentId,
            StudentName = request.StudentName,
            StudentEmail = request.StudentEmail,
            ClassId = request.ClassId,
            CheckedInAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm"),
            PointsEarned = evt.ConductPoints
        });

        evt.AttendeesJson = JsonSerializer.Serialize(attendees);
        await _context.SaveChangesAsync();
        await WriteAuditAsync($"{request.StudentName} ({request.StudentId})", "EVENT_CHECKIN", evt.Id, $"Checked in to '{evt.Title}' (+{evt.ConductPoints} pts).");

        return Ok(evt);
    }

    public record EventCheckInRequest(string StudentId, string StudentName, string StudentEmail, string ClassId);

    public class EventCheckInItem
    {
        public string StudentId { get; set; } = "";
        public string StudentName { get; set; } = "";
        public string StudentEmail { get; set; } = "";
        public string ClassId { get; set; } = "";
        public string CheckedInAt { get; set; } = "";
        public int PointsEarned { get; set; }
    }
}

public record TuitionPublishRequest(
    string? StudentEmail,
    string Semester,
    int Credits,
    decimal AmountVnd,
    string Note,
    List<string>? RecipientEmails);

public record TicketReplyRequest(string TicketId, string Status, string AdminReply);