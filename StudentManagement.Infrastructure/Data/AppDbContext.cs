using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;

namespace StudentManagement.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Bảng gốc của hệ thống
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();
    public DbSet<SchoolClass> SchoolClasses { get; set; }
    public DbSet<Semester> Semesters { get; set; }
    public DbSet<AttendanceRecord> AttendanceRecords { get; set; }

    // Bảng mở rộng cho Portal (lưu bền vững trên PostgreSQL)
    public DbSet<ClassSection> ClassSections => Set<ClassSection>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<TuitionInvoice> TuitionInvoices => Set<TuitionInvoice>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<PortalAssignment> PortalAssignments => Set<PortalAssignment>();
    public DbSet<AttendanceSummary> AttendanceSummaries => Set<AttendanceSummary>();
    public DbSet<ScholarshipAward> ScholarshipAwards => Set<ScholarshipAward>();
    public DbSet<CampusEvent> CampusEvents => Set<CampusEvent>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Gpa).HasPrecision(4, 2);
        });

        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
        });

        modelBuilder.Entity<ClassSection>().HasKey(e => e.Id);
        modelBuilder.Entity<StudentProfile>().HasKey(e => e.Email);
        modelBuilder.Entity<TuitionInvoice>().HasKey(e => e.Id);
        modelBuilder.Entity<Announcement>().HasKey(e => e.Id);
        modelBuilder.Entity<SupportTicket>().HasKey(e => e.Id);
        modelBuilder.Entity<PortalAssignment>().HasKey(e => e.Id);
        modelBuilder.Entity<AttendanceSummary>().HasKey(e => e.Id);
        modelBuilder.Entity<ScholarshipAward>().HasKey(e => e.StudentId);
        modelBuilder.Entity<CampusEvent>().HasKey(e => e.Id);
        modelBuilder.Entity<AuditLog>().HasKey(e => e.Id);
    }
}