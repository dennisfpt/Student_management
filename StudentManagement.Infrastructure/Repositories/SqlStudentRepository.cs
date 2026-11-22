using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.Infrastructure.Repositories;

public class SqlStudentRepository : IStudentRepository
{
    private readonly AppDbContext _context;

    public SqlStudentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Student student)
    {
        await _context.Students.AddAsync(student);
        await _context.SaveChangesAsync();
    }

    public async Task<Student?> GetByIdAsync(string id)
    {
        return await _context.Students.FindAsync(id);
    }

    public async Task<IEnumerable<Student>> GetPageAsync(int page, int size)
    {
        return await _context.Students
            .AsNoTracking()
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();
    }

    public async IAsyncEnumerable<Student> StreamAllAsync()
    {
        await foreach (var student in _context.Students.AsNoTracking().AsAsyncEnumerable())
        {
            yield return student;
        }
    }

    public async Task<bool> UpdateAsync(Student student)
    {
        _context.Students.Update(student);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null) return false;

        _context.Students.Remove(student);
        return await _context.SaveChangesAsync() > 0;
    }
}