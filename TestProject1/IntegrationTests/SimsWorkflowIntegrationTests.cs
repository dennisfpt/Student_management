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

        var registerReq = new PortalRegisterRequest(
            FullName: "Dr. Tran Minh",
            Email: "new.lecturer@unit.edu.vn",
            Password: "Pass@2026",
            Role: "Teacher",
            UserCode: null,
            Phone: null,
            Major: "Information Technology");

        // Act 1: Đăng ký tài khoản mới -> lưu vào Database
        var regResult = await authController.Register(registerReq) as OkObjectResult;

        // Assert 1: Lưu thành công
        Assert.NotNull(regResult);
        Assert.Equal(200, regResult.StatusCode);
        Assert.Equal(1, await context.UserAccounts.CountAsync());

        // Act 2: Đăng nhập bằng tài khoản vừa tạo
        var loginResult = await authController.Login(
            new PortalLoginRequest("new.lecturer@unit.edu.vn", "Pass@2026")) as OkObjectResult;

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

        var emailReq = new SendNotificationEmailRequest(
            "an.nv@unit.edu.vn",
            "Exam Schedule",
            "Your final exam is on Monday.");

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
        var fakeEmail = new FakeEmailService();
        var academicController = new AcademicController(context, fakeEmail);
        var attendanceController = new AttendanceController(context);

        var newClass = new ClassSection
        {
            Id = "IT-K26C1",
            Name = "Software Engineering Cohort 5",
            Department = "Information Technology",
            MaxCapacity = 30,
            Status = "Active"
        };

        // Act 1: Tạo lớp học mới
        var classRes = await academicController.AddClass(newClass) as OkObjectResult;
        Assert.NotNull(classRes);
        Assert.Equal("IT-K26C1", (await context.ClassSections.FirstAsync()).Id);

        // Act 2: Lưu danh sách điểm danh hàng loạt qua AttendanceController
        var attendanceBatch = new List<AttendanceSummaryRequest>
        {
            new("SV001", "Nguyen Van An", "IT-K26C1", 15, 15, 0, "Prof. Nguyen Van Minh"),
            new("SV002", "Tran Thi Bich", "IT-K26C1", 15, 14, 1, "Prof. Nguyen Van Minh")
        };

        var attRes = await attendanceController.SaveClassAttendance(attendanceBatch) as OkObjectResult;

        // Assert: Toàn bộ 2 bản ghi điểm danh nằm trong DB
        Assert.NotNull(attRes);
        Assert.Equal(2, await context.AttendanceSummaries.CountAsync());
    }
}