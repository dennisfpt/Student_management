using Microsoft.AspNetCore.Mvc;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourseController : ControllerBase
{
    private readonly ICourseRepository _repository;

    public CourseController(ICourseRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var courses = await _repository.GetAllAsync();
        return Ok(courses);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Course course)
    {
        if (string.IsNullOrWhiteSpace(course.Id) || string.IsNullOrWhiteSpace(course.Title))
            return BadRequest(new { error = "Mã môn học và Tên môn không được để trống." });

        var existing = await _repository.GetByIdAsync(course.Id);
        if (existing != null)
            return BadRequest(new { error = "Mã môn học đã tồn tại!" });

        await _repository.AddAsync(course);
        return Ok(course);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted) return NotFound(new { error = "Không tìm thấy môn học." });
        return Ok(new { message = "Đã xóa môn học thành công." });
    }
}