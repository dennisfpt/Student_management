using Microsoft.EntityFrameworkCore;
using Npgsql;
using StudentManagement.Application.Interfaces;
using StudentManagement.Application.Policies;
using StudentManagement.Application.Services;
using StudentManagement.Application.Validators;
using StudentManagement.Domain.Interfaces;
using StudentManagement.Infrastructure.Data;
using StudentManagement.Infrastructure.Repositories;
using StudentManagement.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

var rawConnStr = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";

static bool IsPostgresConnectionString(string value)
{
    if (string.IsNullOrWhiteSpace(value)) return false;
    return value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
        || value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)
        || value.Contains("Host=", StringComparison.OrdinalIgnoreCase)
        || value.Contains("Server=", StringComparison.OrdinalIgnoreCase) && value.Contains("Port=", StringComparison.OrdinalIgnoreCase);
}

static string NormalizePostgresConnectionString(string value)
{
    if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
        !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        return value;
    }

    var uri = new Uri(value);
    var userInfo = uri.UserInfo.Split(':', 2);
    var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var database = uri.AbsolutePath.TrimStart('/');
    var port = uri.Port > 0 ? uri.Port : 5432;

    var npgsqlBuilder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = port,
        Database = database,
        Username = username,
        Password = password,
        SslMode = SslMode.Require
    };

    return npgsqlBuilder.ConnectionString;
}

// 1. Cấu hình DbContext: dùng PostgreSQL khi có chuỗi kết nối Postgres, ngược lại dùng SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (IsPostgresConnectionString(rawConnStr))
    {
        options.UseNpgsql(NormalizePostgresConnectionString(rawConnStr));
    }
    else
    {
        options.UseSqlServer(rawConnStr);
    }
});

// 2. Đăng ký Dependency Injection cho Repositories, Policies & Services
builder.Services.AddScoped<IStudentRepository, SqlStudentRepository>();
builder.Services.AddScoped<ITeacherRepository, SqlTeacherRepository>();
builder.Services.AddScoped<ICourseRepository, SqlCourseRepository>();
builder.Services.AddScoped<IGradeRepository, SqlGradeRepository>();
builder.Services.AddScoped<IAttendanceRepository, SqlAttendanceRepository>();

builder.Services.AddTransient<IStudentValidator, StudentValidator>();
builder.Services.AddTransient<ITuitionPolicy, StandardTuitionPolicy>();
builder.Services.AddScoped<IStudentService, StudentService>();

// 3. Đăng ký Controllers & Swagger API Documentation
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IEmailService, StudentManagement.Infrastructure.Services.EmailService>();

var app = builder.Build();

// 4. Tự động tạo bảng (nếu chưa có) và nạp dữ liệu mẫu (Seed Data) khi khởi chạy
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.EnsureCreatedAsync();
    await DbSeeder.SeedAsync(context);
}

// 5. Cấu hình môi trường Development & Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 6. Cấu hình file tĩnh: Đặt login.html làm trang mặc định khi vào "/"
var defaultFileOptions = new DefaultFilesOptions();
defaultFileOptions.DefaultFileNames.Clear();
defaultFileOptions.DefaultFileNames.Add("login.html");
defaultFileOptions.DefaultFileNames.Add("index.html");

app.UseDefaultFiles(defaultFileOptions);
app.UseStaticFiles();

app.UseAuthorization();

// 7. Định tuyến Controllers
app.MapControllers();

app.Run();