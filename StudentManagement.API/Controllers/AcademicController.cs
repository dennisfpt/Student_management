using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AcademicController : ControllerBase
{
    private readonly AppDbContext _context;

    public AcademicController(AppDbContext context)
    {
        _context = context;
    }

    // --- 1. CLASSES (LỚP HỌC) ---
    [HttpGet("classes")]
    public async Task<IActionResult> GetClasses() => Ok(await _context.SchoolClasses.ToListAsync());

    [HttpPost("classes")]
    public async Task<IActionResult> CreateClass([FromBody] SchoolClass model)
    {
        if (await _context.SchoolClasses.AnyAsync(c => c.Id == model.Id))
            return BadRequest(new { error = "Class ID already exists!" });

        _context.SchoolClasses.Add(model);
        await _context.SaveChangesAsync();
        return Ok(model);
    }

    [HttpDelete("classes/{id}")]
    public async Task<IActionResult> DeleteClass(string id)
    {
        var item = await _context.SchoolClasses.FindAsync(id);
        if (item == null) return NotFound();
        _context.SchoolClasses.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // --- 2. SEMESTERS (HỌC KỲ) ---
    [HttpGet("semesters")]
    public async Task<IActionResult> GetSemesters() => Ok(await _context.Semesters.ToListAsync());

    [HttpPost("semesters")]
    public async Task<IActionResult> CreateSemester([FromBody] Semester model)
    {
        if (await _context.Semesters.AnyAsync(s => s.Id == model.Id))
            return BadRequest(new { error = "Semester ID already exists!" });

        _context.Semesters.Add(model);
        await _context.SaveChangesAsync();
        return Ok(model);
    }

    [HttpDelete("semesters/{id}")]
    public async Task<IActionResult> DeleteSemester(string id)
    {
        var item = await _context.Semesters.FindAsync(id);
        if (item == null) return NotFound();
        _context.Semesters.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // --- 3. ACCOUNTS (TÀI KHOẢN & PHÂN QUYỀN) ---
    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccounts()
    {
        var list = await _context.UserAccounts
            .Select(u => new { u.Username, u.FullName, u.Role, Status = "Active" })
            .ToListAsync();
        return Ok(list);
    }

    [HttpDelete("accounts/{username}")]
    public async Task<IActionResult> DeleteAccount(string username)
    {
        var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return NotFound();
        _context.UserAccounts.Remove(user);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // --- 4. ATTENDANCE (ĐIỂM DANH THẬT) ---
    [HttpGet("attendance")]
    public async Task<IActionResult> GetAttendance() => Ok(await _context.AttendanceRecords.ToListAsync());

    [HttpPost("attendance/bulk")]
    public async Task<IActionResult> SaveBulkAttendance([FromBody] List<AttendanceRecord> records)
    {
        foreach (var rec in records)
        {
            rec.Date = DateTime.UtcNow;
            _context.AttendanceRecords.Add(rec);
        }
        await _context.SaveChangesAsync();
        return Ok(new { message = "Attendance records persisted to SQL Server!" });
    }
}