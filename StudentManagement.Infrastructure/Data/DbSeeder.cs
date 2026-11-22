using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // 1. Seed & Sync UNIT University Accounts
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

        // 2. Seed đầy đủ 500 Students trên 18 lớp (14 * 28 + 4 * 27 = 500)
        if (!await context.Students.AnyAsync())
        {
            string[] classIds = new[]
            {
                "IT-K26A1", "IT-K26A2", "IT-K26A3", "IT-K26B1", "IT-K26B2", "IT-K26B3",
                "MKT-K26A1", "MKT-K26A2", "MKT-K26A3", "MKT-K26B1", "MKT-K26B2", "MKT-K26B3",
                "GD-K26A1", "GD-K26A2", "GD-K26A3", "GD-K26B1", "GD-K26B2", "GD-K26B3"
            };

            string[] lastNames = new[] { "Nguyen", "Tran", "Le", "Pham", "Hoang", "Huynh", "Phan", "Vu", "Vo", "Dang", "Bui", "Do", "Ho", "Ngo", "Duong" };
            string[] midNames = new[] { "Van", "Thi", "Minh", "Hoang", "Ngoc", "Thanh", "Quoc", "Gia", "Anh", "Khanh" };
            string[] firstNames = new[] { "An", "Binh", "Chau", "Dung", "Duy", "Giang", "Ha", "Hai", "Hieu", "Huy", "Khoa", "Linh", "Long", "Mai", "Nam", "Nga", "Nhi", "Phong", "Phuc", "Quynh", "Son", "Tam", "Thao", "Trang", "Tuan", "Vy", "Yen" };

            var studentsToSeed = new List<Student>(500);
            int counter = 1;

            for (int cIdx = 0; cIdx < classIds.Length; cIdx++)
            {
                int targetSize = cIdx < 14 ? 28 : 27;

                for (int s = 0; s < targetSize; s++)
                {
                    string stId = $"SV26{counter:D3}";
                    string fullName = counter == 1
                        ? "Nguyen Thi Mai"
                        : $"{lastNames[(counter * 3) % lastNames.Length]} {midNames[(counter * 7) % midNames.Length]} {firstNames[(counter * 11) % firstNames.Length]}";

                    string email = counter == 1
                        ? "an.nv@unit.edu.vn"
                        : $"sv26{counter:D3}@unit.edu.vn";

                    int month = (counter % 12) + 1;
                    int day = (counter % 27) + 1;
                    double gpa = Math.Round(2.6 + ((counter * 17) % 140) / 100.0, 2);

                    studentsToSeed.Add(new Student
                    {
                        Id = stId,
                        FullName = fullName,
                        Email = email,
                        DateOfBirth = new DateTime(2006, month, day, 0, 0, 0, DateTimeKind.Utc),
                        Gpa = gpa
                    });

                    counter++;
                }
            }

            Debug.Assert(studentsToSeed.Count == 500, $"Expected 500 students, got {studentsToSeed.Count}");

            await context.Students.AddRangeAsync(studentsToSeed);
            await context.SaveChangesAsync();
        }

        // 3. Seed Lecturers / Faculty
        if (!await context.Teachers.AnyAsync())
        {
            context.Teachers.AddRange(
                new Teacher { Id = "GV001", FullName = "Prof. Nguyen Van Minh", Email = "lecturer@unit.edu.vn", Department = "Information Technology", PhoneNumber = "0901234567" },
                new Teacher { Id = "GV002", FullName = "Dr. Le Thao Nhi", Email = "nhi.lt@unit.edu.vn", Department = "Applied Mathematics", PhoneNumber = "0908765432" },
                new Teacher { Id = "GV003", FullName = "Prof. Tran Minh Quan", Email = "quan.tm@unit.edu.vn", Department = "Cybersecurity & AI", PhoneNumber = "0912345678" }
            );
            await context.SaveChangesAsync();
        }

        // 4. Seed Courses
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
            var firstStudent = await context.Students.OrderBy(s => s.Id).FirstAsync();
            context.Grades.AddRange(
                new Grade { StudentId = firstStudent.Id, CourseId = "PROG101", MidtermScore = 8.5, FinalScore = 9.0, TotalGpa = 3.6, Status = "Pass" },
                new Grade { StudentId = firstStudent.Id, CourseId = "MATH201", MidtermScore = 7.5, FinalScore = 8.0, TotalGpa = 3.2, Status = "Pass" }
            );
            await context.SaveChangesAsync();
        }
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }
}