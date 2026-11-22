using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private readonly IStudentRepository _repository;
    private readonly IStudentService _studentService;
    private readonly AppDbContext _context;

    public StudentController(
        IStudentRepository repository,
        IStudentService studentService,
        AppDbContext context)
    {
        _repository = repository;
        _studentService = studentService;
        _context = context;
    }

    // GET: api/Student?page=1&size=100
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int size = 100)
    {
        var students = await _repository.GetPageAsync(page, size);
        return Ok(students);
    }

    // POST: api/Student/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] Student student)
    {
        try
        {
            student.DateOfBirth = DateTime.SpecifyKind(student.DateOfBirth, DateTimeKind.Utc);
            await _studentService.RegisterStudentAsync(student);
            return Ok(student);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // PUT: api/Student/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Student student)
    {
        if (id != student.Id)
        {
            return BadRequest(new { error = "Student ID mismatch." });
        }

        student.DateOfBirth = DateTime.SpecifyKind(student.DateOfBirth, DateTimeKind.Utc);
        await _repository.UpdateAsync(student);
        return Ok(student);
    }

    // DELETE: api/Student/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _repository.DeleteAsync(id);
        return Ok(new { message = "Student deleted successfully." });
    }

    // POST: api/Student/avatar
    [HttpPost("avatar")]
    public async Task<IActionResult> UpdateAvatar([FromBody] StudentAvatarRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.AvatarBase64))
        {
            return BadRequest(new { message = "Email and image data are required." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var profile = await _context.StudentProfiles.FirstOrDefaultAsync(p => p.Email.ToLower() == email);

        if (profile != null)
        {
            profile.AvatarBase64 = request.AvatarBase64;
        }
        else
        {
            _context.StudentProfiles.Add(new StudentProfile
            {
                Email = email,
                FullName = request.DefaultName ?? "",
                AvatarBase64 = request.AvatarBase64
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { avatarBase64 = request.AvatarBase64 });
    }
}

public record StudentAvatarRequest(string Email, string? DefaultName, string AvatarBase64);