using Microsoft.AspNetCore.Mvc;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeacherController : ControllerBase
{
    private readonly ITeacherRepository _repository;

    public TeacherController(ITeacherRepository repository)
    {
        _repository = repository;
    }
    // ... các hàm còn lại giữ nguyên


    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var teachers = await _repository.GetAllAsync();
        return Ok(teachers);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Teacher teacher)
    {
        if (string.IsNullOrWhiteSpace(teacher.Id) || string.IsNullOrWhiteSpace(teacher.FullName))
            return BadRequest(new { error = "Mã GV và Họ tên không được để trống." });

        var existing = await _repository.GetByIdAsync(teacher.Id);
        if (existing != null)
            return BadRequest(new { error = "Mã giảng viên này đã tồn tại!" });

        await _repository.AddAsync(teacher);
        return Ok(teacher);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Teacher teacher)
    {
        if (id != teacher.Id) return BadRequest(new { error = "ID không trùng khớp." });
        await _repository.UpdateAsync(teacher);
        return Ok(teacher);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _repository.DeleteAsync(id);
        return Ok(new { message = "Đã xóa giảng viên thành công." });
    }
}