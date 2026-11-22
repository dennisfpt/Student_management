using Microsoft.AspNetCore.Mvc;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceRepository _repository;

    public AttendanceController(IAttendanceRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _repository.GetAllAsync();
        return Ok(data);
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetByCourse(string courseId)
    {
        var data = await _repository.GetByCourseAsync(courseId);
        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Record([FromBody] Attendance attendance)
    {
        if (string.IsNullOrWhiteSpace(attendance.StudentId) || string.IsNullOrWhiteSpace(attendance.CourseId))
            return BadRequest(new { error = "Mã sinh viên và môn học là bắt buộc." });

        await _repository.AddAsync(attendance);
        return Ok(attendance);
    }
}