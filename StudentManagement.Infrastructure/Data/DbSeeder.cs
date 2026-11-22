using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // 1. Seed & Sync UNIT University Accounts (Chạy mỗi lần khởi động để đảm bảo đúng tài khoản)
        var unitAccounts = new List<UserAccount>
        {
            new() { Username = "admin@unit.edu.vn", PasswordHash = HashPassword("Admin@123"), FullName = "Admin Mark Averous", Role = "Admin" },
            new() { Username = "lecturer@unit.edu.vn", PasswordHash = HashPassword("Teacher@123"), FullName = "Prof. Nguyen Van Minh", Role = "Teacher" },
            new() { Username = "student@unit.edu.vn", PasswordHash = HashPassword("Student@123"), FullName = "Nguyen Van An", Role = "Student" }
        };

        foreach (var acc in unitAccounts)
        {
            var existing = await context.UserAccounts.FirstOrDefaultAsync(u => u.Username == acc.Username);
            if (existing == null)
            {
                context.UserAccounts.Add(acc);
            }
            else
            {
                existing.PasswordHash = acc.PasswordHash;
                existing.FullName = acc.FullName;
                existing.Role = acc.Role;
            }
        }
        await context.SaveChangesAsync();

        // 2. Seed Students (English)
        if (!await context.Students.AnyAsync())
        {
            context.Students.AddRange(
                new Student { Id = "SV001", FullName = "Nguyen Van An", Email = "an.nv@unit.edu.vn", DateOfBirth = new DateTime(2005, 5, 12), Gpa = 3.8 },
                new Student { Id = "SV002", FullName = "Tran Thi Bich", Email = "bich.tt@unit.edu.vn", DateOfBirth = new DateTime(2005, 8, 20), Gpa = 3.5 },
                new Student { Id = "SV003", FullName = "Le Minh Cuong", Email = "cuong.lm@unit.edu.vn", DateOfBirth = new DateTime(2005, 2, 14), Gpa = 3.9 },
                new Student { Id = "SV004", FullName = "Pham Thi Dung", Email = "dung.pt@unit.edu.vn", DateOfBirth = new DateTime(2005, 11, 2), Gpa = 3.2 }
            );
            await context.SaveChangesAsync();
        }

        // 3. Seed Lecturers / Faculty (English)
        if (!await context.Teachers.AnyAsync())
        {
            context.Teachers.AddRange(
                new Teacher { Id = "GV001", FullName = "Prof. Nguyen Van Minh", Email = "lecturer@unit.edu.vn", Department = "Information Technology", PhoneNumber = "0901234567" },
                new Teacher { Id = "GV002", FullName = "Dr. Le Thao Nhi", Email = "nhi.lt@unit.edu.vn", Department = "Applied Mathematics", PhoneNumber = "0908765432" },
                new Teacher { Id = "GV003", FullName = "Prof. Tran Minh Quan", Email = "quan.tm@unit.edu.vn", Department = "Cybersecurity & AI", PhoneNumber = "0912345678" }
            );
            await context.SaveChangesAsync();
        }

        // 4. Seed Courses (English)
        if (!await context.Courses.AnyAsync())
        {
            context.Courses.AddRange(
                new Course { Id = "PROG101", Title = "Applied Programming & Clean Architecture", Credits = 15, LecturerName = "Prof. Nguyen Van Minh", Status = "Open" },
                new Course { Id = "MATH201", Title = "Discrete Mathematics & Boolean Logic", Credits = 15, LecturerName = "Dr. Le Thao Nhi", Status = "Open" },
                new Course { Id = "SEC301", Title = "Enterprise Cybersecurity & Attack Monitoring", Credits = 15, LecturerName = "Prof. Tran Minh Quan", Status = "Open" }
            );
            await context.SaveChangesAsync();
        }

        // 5. Seed Sample Grades
        if (!await context.Grades.AnyAsync() && await context.Students.AnyAsync())
        {
            var firstStudent = await context.Students.FirstAsync();
            context.Grades.AddRange(
                new Grade { StudentId = firstStudent.Id, CourseId = "PROG101", MidtermScore = 8.5, FinalScore = 9.0, TotalGpa = 3.6, Status = "Pass" },
                new Grade { StudentId = firstStudent.Id, CourseId = "MATH201", MidtermScore = 7.5, FinalScore = 8.0, TotalGpa = 3.2, Status = "Pass" }
            );
            await context.SaveChangesAsync();
        }
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}