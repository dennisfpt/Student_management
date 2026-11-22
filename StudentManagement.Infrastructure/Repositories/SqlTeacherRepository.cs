using StudentManagement.Domain.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace StudentManagement.Infrastructure.Repositories;

public class SqlTeacherRepository : ITeacherRepository
{
    private readonly AppDbContext _context;

    public SqlTeacherRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Teacher>> GetAllAsync()
    {
        return await _context.Teachers.AsNoTracking().ToListAsync();
    }

    public async Task<Teacher?> GetByIdAsync(string id)
    {
        return await _context.Teachers.FindAsync(id);
    }

    public async Task AddAsync(Teacher teacher)
    {
        await _context.Teachers.AddAsync(teacher);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Teacher teacher)
    {
        _context.Teachers.Update(teacher);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(string id)
    {
        var teacher = await _context.Teachers.FindAsync(id);
        if (teacher != null)
        {
            _context.Teachers.Remove(teacher);
            await _context.SaveChangesAsync();
        }
    }
}