using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Controllers;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;
using Xunit;

namespace StudentManagement.Tests.IntegrationTests;

// Giả lập dịch vụ gửi Email để không spam mail thật khi chạy test tự động
public class FakeEmailService : IEmailService
{
    public List<(string To, string Subject)> SentEmails { get; } = new();

    public Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
    {
        SentEmails.Add((toEmail, subject));
        return Task.CompletedTask;
    }
}

public class SimsWorkflowIntegrationTests
{
    private AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task AuthFlow_RegisterAndLogin_ShouldPersistAndAuthenticateUser()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var fakeEmail = new FakeEmailService();
        var authController = new AuthController(context, fakeEmail);

        var registerReq = new RegisterRequest("new.lecturer@unit.edu.vn", "Pass@2026", "Dr. Tran Minh", "Teacher");

        // Act 1: Đăng ký tài khoản mới -> lưu vào Database
        var regResult = await authController.Register(registerReq) as OkObjectResult;

        // Assert 1: Lưu thành công
        Assert.NotNull(regResult);
        Assert.Equal(200, regResult.StatusCode);
        Assert.Equal(1, await context.UserAccounts.CountAsync());

        // Act 2: Đăng nhập bằng tài khoản vừa tạo
        var loginResult = await authController.Login(new LoginRequest("new.lecturer@unit.edu.vn", "Pass@2026")) as OkObjectResult;

        // Assert 2: Xác thực thành công
        Assert.NotNull(loginResult);
        Assert.Equal(200, loginResult.StatusCode);
    }

    [Fact]
    public async Task AuthFlow_SendStudentEmail_ShouldInvokeEmailService()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var fakeEmail = new FakeEmailService();
        var authController = new AuthController(context, fakeEmail);

        var emailReq = new SendEmailRequest("an.nv@unit.edu.vn", "Exam Schedule", "Your final exam is on Monday.");

        // Act
        var result = await authController.SendEmailToStudent(emailReq) as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Single(fakeEmail.SentEmails);
        Assert.Equal("an.nv@unit.edu.vn", fakeEmail.SentEmails[0].To);
    }

    [Fact]
    public async Task AcademicFlow_CreateClassAndBulkAttendance_ShouldPersistToDatabase()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var academicController = new AcademicController(context);

        var newClass = new SchoolClass
        {
            Id = "DHTK05",
            Name = "Software Engineering Cohort 5",
            Department = "Information Technology",
            Capacity = 50,
            Status = "Active"
        };

        // Act 1: Tạo lớp học mới
        var classRes = await academicController.CreateClass(newClass) as OkObjectResult;
        Assert.NotNull(classRes);
        Assert.Equal("DHTK05", (await context.SchoolClasses.FirstAsync()).Id);

        // Act 2: Lưu danh sách điểm danh hàng loạt
        var attendanceBatch = new List<AttendanceRecord>
        {
            new() { StudentId = "SV001", CourseId = "PROG101", Status = "Present", Note = "On time" },
            new() { StudentId = "SV002", CourseId = "PROG101", Status = "Absent", Note = "Sick leave" }
        };

        var attRes = await academicController.SaveBulkAttendance(attendanceBatch) as OkObjectResult;

        // Assert: Toàn bộ 2 bản ghi điểm danh nằm trong DB
        Assert.NotNull(attRes);
        Assert.Equal(2, await context.AttendanceRecords.CountAsync());
    }
}