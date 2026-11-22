using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeacherController : ControllerBase
{
    private readonly AppDbContext _context;

    public TeacherController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Teacher
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var teachers = await _context.Teachers.AsNoTracking().ToListAsync();
        return Ok(teachers);
    }

    // POST: api/Teacher
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TeacherRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Full name and email are required." });
        }

        var id = string.IsNullOrWhiteSpace(request.Id)
            ? $"GV{(await _context.Teachers.CountAsync() + 1):D3}"
            : request.Id.Trim();

        var teacher = new Teacher
        {
            Id = id,
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Department = string.IsNullOrWhiteSpace(request.Department) ? "Information Technology" : request.Department.Trim(),
            PhoneNumber = string.IsNullOrWhiteSpace(request.Phone) ? "0901234567" : request.Phone.Trim()
        };

        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            teacher.Id,
            teacher.FullName,
            teacher.Email,
            Department = teacher.Department,
            Phone = teacher.PhoneNumber
        });
    }

    // PUT: api/Teacher/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] TeacherRequest request)
    {
        var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.Id == id);
        if (teacher == null)
        {
            return NotFound();
        }

        teacher.FullName = request.FullName.Trim();
        teacher.Email = request.Email.Trim().ToLowerInvariant();
        teacher.Department = string.IsNullOrWhiteSpace(request.Department) ? teacher.Department : request.Department.Trim();
        teacher.PhoneNumber = string.IsNullOrWhiteSpace(request.Phone) ? teacher.PhoneNumber : request.Phone.Trim();

        await _context.SaveChangesAsync();

        return Ok(new
        {
            teacher.Id,
            teacher.FullName,
            teacher.Email,
            Department = teacher.Department,
            Phone = teacher.PhoneNumber
        });
    }

    // DELETE: api/Teacher/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.Id == id);
        if (teacher == null)
        {
            return NotFound();
        }

        _context.Teachers.Remove(teacher);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Lecturer deleted successfully." });
    }
}

public record TeacherRequest(
    string? Id,
    string FullName,
    string Email,
    string? Department,
    string? Phone);