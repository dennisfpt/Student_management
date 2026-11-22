using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _context;

    public AttendanceController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Attendance/summary?classId=IT-K26A1
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] string? classId)
    {
        var query = _context.AttendanceSummaries.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(classId))
        {
            query = query.Where(x => x.ClassId == classId);
        }

        var list = await query.ToListAsync();
        return Ok(list);
    }

    // POST: api/Attendance/save
    [HttpPost("save")]
    public async Task<IActionResult> SaveClassAttendance([FromBody] List<AttendanceSummaryRequest> records)
    {
        if (records == null || records.Count == 0)
        {
            return BadRequest(new { message = "Attendance records cannot be empty." });
        }

        int bannedCount = 0;
        var updatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");

        foreach (var r in records)
        {
            double rate = r.TotalSessions > 0 ? (double)r.AttendedSessions / r.TotalSessions * 100.0 : 100.0;
            if (rate < 80.0)
            {
                bannedCount++;
            }

            var existing = await _context.AttendanceSummaries
                .FirstOrDefaultAsync(x => x.StudentId == r.StudentId && x.ClassId == r.ClassId);

            if (existing != null)
            {
                existing.StudentName = r.StudentName;
                existing.TotalSessions = r.TotalSessions;
                existing.AttendedSessions = r.AttendedSessions;
                existing.AbsentSessions = r.AbsentSessions;
                existing.UpdatedBy = r.UpdatedBy;
                existing.UpdatedAt = updatedAt;
            }
            else
            {
                _context.AttendanceSummaries.Add(new AttendanceSummary
                {
                    StudentId = r.StudentId,
                    StudentName = r.StudentName,
                    ClassId = r.ClassId,
                    TotalSessions = r.TotalSessions,
                    AttendedSessions = r.AttendedSessions,
                    AbsentSessions = r.AbsentSessions,
                    UpdatedBy = r.UpdatedBy,
                    UpdatedAt = updatedAt
                });
            }
        }

        var classId = records[0].ClassId;
        var actor = string.IsNullOrWhiteSpace(records[0].UpdatedBy) ? "Lecturer" : records[0].UpdatedBy;

        _context.AuditLogs.Add(new AuditLog
        {
            Id = "LOG-" + DateTime.UtcNow.ToString("HHmmssfff"),
            Actor = actor,
            Action = "ATTENDANCE_LOCK",
            Target = $"Class {classId}",
            Detail = $"Synced attendance for {records.Count} students ({bannedCount} flagged Ineligible for Exam < 80%).",
            Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
        });

        await _context.SaveChangesAsync();

        return Ok(new { saved = records.Count, bannedCount });
    }
}

public record AttendanceSummaryRequest(
    string StudentId,
    string StudentName,
    string ClassId,
    int TotalSessions,
    int AttendedSessions,
    int AbsentSessions,
    string UpdatedBy);