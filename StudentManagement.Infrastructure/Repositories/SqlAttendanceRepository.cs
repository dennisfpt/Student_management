using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.Infrastructure.Repositories;

public class SqlAttendanceRepository : IAttendanceRepository
{
    private readonly AppDbContext _context;

    public SqlAttendanceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Attendance>> GetAllAsync()
    {
        return await _context.Attendances.AsNoTracking().ToListAsync();
    }

    public async Task<IEnumerable<Attendance>> GetByCourseAsync(string courseId)
    {
        return await _context.Attendances
            .AsNoTracking()
            .Where(a => a.CourseId == courseId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Attendance>> GetByStudentAsync(string studentId)
    {
        return await _context.Attendances
            .AsNoTracking()
            .Where(a => a.StudentId == studentId)
            .ToListAsync();
    }

    public async Task AddAsync(Attendance attendance)
    {
        await _context.Attendances.AddAsync(attendance);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> UpdateAsync(Attendance attendance)
    {
        _context.Attendances.Update(attendance);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _context.Attendances.FindAsync(id);
        if (item == null) return false;

        _context.Attendances.Remove(item);
        return await _context.SaveChangesAsync() > 0;
    }
}