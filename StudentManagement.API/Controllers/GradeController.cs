using Microsoft.AspNetCore.Mvc;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GradeController : ControllerBase
{
    private readonly IGradeRepository _repository;

    public GradeController(IGradeRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var grades = await _repository.GetAllAsync();
        return Ok(grades);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Grade grade)
    {
        // Tính toán điểm tổng kết tự động
        var total = (grade.MidtermScore * 0.4) + (grade.FinalScore * 0.6);
        grade.TotalGpa = Math.Round(total / 10.0 * 4.0, 2);
        grade.Status = grade.TotalGpa >= 2.0 ? "Pass" : "Fail";

        await _repository.AddAsync(grade);
        return Ok(grade);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Grade grade)
    {
        grade.Id = id;
        var total = (grade.MidtermScore * 0.4) + (grade.FinalScore * 0.6);
        grade.TotalGpa = Math.Round(total / 10.0 * 4.0, 2);
        grade.Status = grade.TotalGpa >= 2.0 ? "Pass" : "Fail";

        var updated = await _repository.UpdateAsync(grade);
        if (!updated) return NotFound();
        return Ok(grade);
    }
}