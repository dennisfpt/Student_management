using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GradeController : ControllerBase
{
    private readonly AppDbContext _context;

    public GradeController(AppDbContext context)
    {
        _context = context;
    }

    public class AssignmentSubmissionItem
    {
        public string StudentId { get; set; } = "";
        public string StudentName { get; set; } = "";
        public string StudentEmail { get; set; } = "";
        public string FileName { get; set; } = "";
        public string FileDataOrLink { get; set; } = "";
        public string Note { get; set; } = "";
        public string SubmittedAt { get; set; } = "";
        public double? Score { get; set; }
        public string Feedback { get; set; } = "";
    }

    // GET: api/Grade/assignments?classId=IT-K26A1
    [HttpGet("assignments")]
    public async Task<IActionResult> GetAssignments([FromQuery] string? classId)
    {
        var query = _context.PortalAssignments.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(classId))
        {
            query = query.Where(a => a.ClassId == classId);
        }

        var list = await query.ToListAsync();
        return Ok(list);
    }

    // POST: api/Grade/assignments
    [HttpPost("assignments")]
    public async Task<IActionResult> CreateAssignment([FromBody] PortalAssignment request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.ClassId))
        {
            return BadRequest(new { message = "Class and Title are required." });
        }

        var createdAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
        request.Id = "ASM-" + DateTime.UtcNow.ToString("MMdd-HHmmss");
        request.CreatedAt = createdAt;
        request.SubmissionsJson = string.IsNullOrWhiteSpace(request.SubmissionsJson) ? "[]" : request.SubmissionsJson;

        _context.PortalAssignments.Add(request);

        _context.Announcements.Add(new Announcement
        {
            Id = "NOTIF-" + DateTime.UtcNow.ToString("HHmmss"),
            Category = "Assignment",
            TargetGroup = $"Class {request.ClassId}",
            TargetClassIdsJson = JsonSerializer.Serialize(new[] { request.ClassId }),
            Title = $"New Assignment ({request.ClassId}): {request.Title}",
            Message = $"Lecturer {request.LecturerName} posted a new assignment. Deadline: {request.DueDate}.",
            CreatedAt = createdAt
        });

        _context.AuditLogs.Add(new AuditLog
        {
            Id = "LOG-" + DateTime.UtcNow.ToString("HHmmssfff"),
            Actor = string.IsNullOrWhiteSpace(request.LecturerName) ? "Lecturer" : request.LecturerName,
            Action = "ASSIGNMENT_POST",
            Target = request.ClassId,
            Detail = $"Published assignment '{request.Title}' (Due: {request.DueDate}).",
            Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
        });

        await _context.SaveChangesAsync();
        return Ok(request);
    }

    // POST: api/Grade/assignments/{assignmentId}/submit
    [HttpPost("assignments/{assignmentId}/submit")]
    public async Task<IActionResult> SubmitAssignment(string assignmentId, [FromBody] AssignmentSubmissionItem submission)
    {
        var assignment = await _context.PortalAssignments.FirstOrDefaultAsync(a => a.Id == assignmentId);
        if (assignment == null)
        {
            return NotFound();
        }

        var submissions = JsonSerializer.Deserialize<List<AssignmentSubmissionItem>>(assignment.SubmissionsJson) ?? new();
        submission.SubmittedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        var existing = submissions.FirstOrDefault(s => s.StudentId.Equals(submission.StudentId, StringComparison.OrdinalIgnoreCase));
        if (existing != null)
        {
            existing.FileName = submission.FileName;
            existing.FileDataOrLink = submission.FileDataOrLink;
            existing.Note = submission.Note;
            existing.SubmittedAt = submission.SubmittedAt;
        }
        else
        {
            submissions.Insert(0, submission);
        }

        assignment.SubmissionsJson = JsonSerializer.Serialize(submissions);

        _context.AuditLogs.Add(new AuditLog
        {
            Id = "LOG-" + DateTime.UtcNow.ToString("HHmmssfff"),
            Actor = $"{submission.StudentName} ({submission.StudentId})",
            Action = "ASSIGNMENT_SUBMIT",
            Target = assignment.Id,
            Detail = $"Submitted '{submission.FileName}' for {assignment.Title}.",
            Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
        });

        await _context.SaveChangesAsync();
        return Ok(assignment);
    }

    // POST: api/Grade/assignments/grade
    [HttpPost("assignments/grade")]
    public async Task<IActionResult> GradeSubmission([FromBody] GradeSubmissionRequest request)
    {
        var assignment = await _context.PortalAssignments.FirstOrDefaultAsync(a => a.Id == request.AssignmentId);
        if (assignment == null)
        {
            return NotFound();
        }

        var submissions = JsonSerializer.Deserialize<List<AssignmentSubmissionItem>>(assignment.SubmissionsJson) ?? new();
        var sub = submissions.FirstOrDefault(s => s.StudentId.Equals(request.StudentId, StringComparison.OrdinalIgnoreCase));
        if (sub == null)
        {
            return NotFound();
        }

        var oldScore = sub.Score;
        sub.Score = request.Score;
        sub.Feedback = request.Feedback;
        assignment.SubmissionsJson = JsonSerializer.Serialize(submissions);

        _context.Announcements.Add(new Announcement
        {
            Id = "GRD-" + DateTime.UtcNow.ToString("HHmmss"),
            Category = "Grade Published",
            TargetGroup = sub.StudentEmail,
            Title = $"Assignment Graded: {assignment.Title}",
            Message = $"Score: {request.Score}/10 — Lecturer Feedback: {request.Feedback}",
            CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")
        });

        _context.AuditLogs.Add(new AuditLog
        {
            Id = "LOG-" + DateTime.UtcNow.ToString("HHmmssfff"),
            Actor = string.IsNullOrWhiteSpace(assignment.LecturerName) ? "Lecturer" : assignment.LecturerName,
            Action = "GRADE_UPDATE",
            Target = $"{sub.StudentId} ({assignment.Id})",
            Detail = $"Graded {sub.StudentName}: {(oldScore.HasValue ? oldScore.Value.ToString("0.0") : "None")} -> {request.Score:0.0}/10.",
            Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
        });

        await _context.SaveChangesAsync();
        return Ok(sub);
    }
}

public record GradeSubmissionRequest(
    string AssignmentId,
    string StudentId,
    double Score,
    string Feedback);