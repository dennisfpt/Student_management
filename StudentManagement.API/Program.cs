using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.Interfaces;
using StudentManagement.Application.Policies;
using StudentManagement.Application.Services;
using StudentManagement.Application.Validators;
using StudentManagement.Domain.Interfaces;
using StudentManagement.Infrastructure.Data;
using StudentManagement.Infrastructure.Repositories;
using StudentManagement.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình DbContext SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// 4. Tự động nạp dữ liệu mẫu (Seed Data) vào SQL Server khi khởi chạy
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
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