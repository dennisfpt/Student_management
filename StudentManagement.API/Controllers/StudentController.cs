using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private readonly IStudentRepository _repository;
    private readonly IStudentService _studentService;

    public StudentController(IStudentRepository repository, IStudentService studentService)
    {
        _repository = repository;
        _studentService = studentService;
    }

    // GET: api/Student hoặc api/Student?page=1&size=100
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
        if (id != student.Id) return BadRequest(new { error = "Mã sinh viên không khớp." });
        await _repository.UpdateAsync(student);
        return Ok(student);
    }

    // DELETE: api/Student/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _repository.DeleteAsync(id);
        return Ok(new { message = "Đã xóa sinh viên thành công." });
    }
}