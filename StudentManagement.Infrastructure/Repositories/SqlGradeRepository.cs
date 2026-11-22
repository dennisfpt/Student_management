using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.Infrastructure.Repositories;

public class SqlGradeRepository : IGradeRepository
{
    private readonly AppDbContext _context;

    public SqlGradeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Grade>> GetAllAsync()
    {
        return await _context.Grades.AsNoTracking().ToListAsync();
    }

    public async Task<IEnumerable<Grade>> GetByStudentIdAsync(string studentId)
    {
        return await _context.Grades
            .AsNoTracking()
            .Where(g => g.StudentId == studentId)
            .ToListAsync();
    }

    public async Task<Grade?> GetByIdAsync(int id)
    {
        return await _context.Grades.FindAsync(id);
    }

    public async Task AddAsync(Grade grade)
    {
        await _context.Grades.AddAsync(grade);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> UpdateAsync(Grade grade)
    {
        _context.Grades.Update(grade);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var grade = await _context.Grades.FindAsync(id);
        if (grade == null) return false;

        _context.Grades.Remove(grade);
        return await _context.SaveChangesAsync() > 0;
    }
}