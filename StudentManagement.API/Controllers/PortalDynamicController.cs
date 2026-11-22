using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using StudentManagement.Domain.Entities;
using StudentManagement.Infrastructure.Data;

namespace StudentManagement.API.Controllers
{
    [ApiController]
    [Route("api/portal")]
    public class PortalDynamicController : ControllerBase
    {
        private static readonly object _lock = new();
        private readonly IServiceProvider _serviceProvider;

        public PortalDynamicController(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public class UserAccountDto
        {
            public string Email { get; set; } = "";
            public string PasswordHash { get; set; } = "";
            public string FullName { get; set; } = "";
            public string Role { get; set; } = "Student";
            public string UserCode { get; set; } = "";
            public string Major { get; set; } = "";
        }

        public class StudentRecordDto
        {
            public string Id { get; set; } = "";
            public string FullName { get; set; } = "";
            public string Email { get; set; } = "";
            public string Major { get; set; } = "";
            public string ClassId { get; set; } = "";
            public string DateOfBirth { get; set; } = "2006-05-15";
            public double Gpa { get; set; } = 3.5;
            public string Status { get; set; } = "Active";
        }

        public class TeacherRecordDto
        {
            public string Id { get; set; } = "";
            public string FullName { get; set; } = "";
            public string Email { get; set; } = "";
            public string Department { get; set; } = "";
            public string Phone { get; set; } = "";
        }

        public class ClassSectionDto
        {
            public string Id { get; set; } = "";
            public string Name { get; set; } = "";
            public string Department { get; set; } = "";
            public string LecturerId { get; set; } = "";
            public string LecturerName { get; set; } = "";
            public int MaxCapacity { get; set; } = 30;
            public string Status { get; set; } = "Active";
        }

        public class CourseRecordDto
        {
            public string Id { get; set; } = "";
            public string Name { get; set; } = "";
            public int Credits { get; set; } = 3;
            public string Department { get; set; } = "";
        }

        public class StudentProfileDto
        {
            public string Email { get; set; } = "";
            public string StudentId { get; set; } = "SV26001";
            public string FullName { get; set; } = "Nguyen Thi Mai";
            public string Phone { get; set; } = "0901234567";
            public string Major { get; set; } = "Information Technology";
            public string AvatarBase64 { get; set; } = "";
        }

        public class AvatarUpdateDto
        {
            public string Email { get; set; } = "";
            public string Role { get; set; } = "Student";
            public string DefaultName { get; set; } = "";
            public string AvatarBase64 { get; set; } = "";
        }

        public class TuitionInvoiceDto
        {
            public string Id { get; set; } = "";
            public string StudentEmail { get; set; } = "ALL";
            public string Semester { get; set; } = "";
            public int Credits { get; set; }
            public decimal AmountVnd { get; set; }
            public string Note { get; set; } = "";
            public string BankCode { get; set; } = "MB";
            public string AccountNo { get; set; } = "0865156242";
            public string AccountName { get; set; } = "DUONG THI KIM YEN";
            public bool Paid { get; set; }
            public string CreatedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            public List<string> RecipientEmails { get; set; } = new();
        }

        public class AnnouncementDto
        {
            public string Id { get; set; } = "";
            public string Category { get; set; } = "Academic";
            public string TargetGroup { get; set; } = "ALL";
            public List<string> TargetClassIds { get; set; } = new();
            public string Title { get; set; } = "";
            public string Message { get; set; } = "";
            public string InvoiceId { get; set; } = "";
            public decimal AmountVnd { get; set; }
            public string CreatedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
        }

        public class EmailBroadcastDto
        {
            public string TargetGroup { get; set; } = "Class";
            public List<string> ClassIds { get; set; } = new();
            public bool IncludeLecturer { get; set; } = true;
            public string Category { get; set; } = "Timetable Change";
            public string Subject { get; set; } = "";
            public string Body { get; set; } = "";
            public List<string> RecipientEmails { get; set; } = new();
        }

        public class SupportTicketDto
        {
            public string Id { get; set; } = "";
            public string StudentId { get; set; } = "";
            public string StudentName { get; set; } = "";
            public string StudentEmail { get; set; } = "";
            public string Category { get; set; } = "Profile Record Update";
            public string Subject { get; set; } = "";
            public string Description { get; set; } = "";
            public string Status { get; set; } = "Pending";
            public string AdminReply { get; set; } = "";
            public string CreatedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            public string UpdatedAt { get; set; } = "";
        }

        public class TicketReplyDto
        {
            public string TicketId { get; set; } = "";
            public string Status { get; set; } = "Resolved";
            public string AdminReply { get; set; } = "";
        }

        public class AuthRegisterDto
        {
            public string FullName { get; set; } = "";
            public string Email { get; set; } = "";
            public string Password { get; set; } = "";
            public string Role { get; set; } = "Student";
            public string UserCode { get; set; } = "";
            public string Phone { get; set; } = "";
            public string Major { get; set; } = "Information Technology";
        }

        public class AuthLoginDto
        {
            public string Email { get; set; } = "";
            public string Password { get; set; } = "";
        }

        public class SubmissionDto
        {
            public string StudentId { get; set; } = "";
            public string StudentName { get; set; } = "";
            public string StudentEmail { get; set; } = "";
            public string FileName { get; set; } = "";
            public string FileDataOrLink { get; set; } = "";
            public string Note { get; set; } = "";
            public string SubmittedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            public double? Score { get; set; }
            public string Feedback { get; set; } = "";
        }

        public class AssignmentDto
        {
            public string Id { get; set; } = "";
            public string ClassId { get; set; } = "";
            public string CourseName { get; set; } = "";
            public string LecturerName { get; set; } = "";
            public string Title { get; set; } = "";
            public string Description { get; set; } = "";
            public string DueDate { get; set; } = "";
            public string CreatedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            public List<SubmissionDto> Submissions { get; set; } = new();
        }

        public class GradeSubmissionDto
        {
            public string AssignmentId { get; set; } = "";
            public string StudentId { get; set; } = "";
            public double Score { get; set; }
            public string Feedback { get; set; } = "";
        }

        public class AttendanceSummaryDto
        {
            public string StudentId { get; set; } = "";
            public string StudentName { get; set; } = "";
            public string ClassId { get; set; } = "";
            public int TotalSessions { get; set; } = 15;
            public int AttendedSessions { get; set; } = 15;
            public int AbsentSessions { get; set; } = 0;
            public string UpdatedBy { get; set; } = "";
            public string UpdatedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
        }

        public class ScholarshipAwardDto
        {
            public string StudentId { get; set; } = "";
            public string StudentName { get; set; } = "";
            public string Major { get; set; } = "";
            public string ClassId { get; set; } = "";
            public double Gpa { get; set; }
            public string Tier { get; set; } = "";
            public decimal WaiverAmountVnd { get; set; }
            public string AwardedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
        }

        public class EventAttendeeDto
        {
            public string StudentId { get; set; } = "";
            public string StudentName { get; set; } = "";
            public string StudentEmail { get; set; } = "";
            public string ClassId { get; set; } = "";
            public string CheckedInAt { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            public int PointsEarned { get; set; }
        }

        public class CampusEventDto
        {
            public string Id { get; set; } = "";
            public string Title { get; set; } = "";
            public string Organizer { get; set; } = "Student Affairs & Clubs";
            public string EventDate { get; set; } = "";
            public string Venue { get; set; } = "";
            public int ConductPoints { get; set; } = 5;
            public string Status { get; set; } = "Upcoming";
            public List<EventAttendeeDto> Attendees { get; set; } = new();
        }

        public class AuditLogDto
        {
            public string Id { get; set; } = "";
            public string Actor { get; set; } = "";
            public string Action { get; set; } = "";
            public string Target { get; set; } = "";
            public string Detail { get; set; } = "";
            public string Timestamp { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        }

        public class PortalState
        {
            public List<UserAccountDto> Accounts { get; set; } = new();
            public List<StudentRecordDto> Students { get; set; } = new();
            public List<TeacherRecordDto> Teachers { get; set; } = new();
            public List<ClassSectionDto> Classes { get; set; } = new();
            public List<CourseRecordDto> Courses { get; set; } = new();
            public List<StudentProfileDto> Profiles { get; set; } = new();
            public List<TuitionInvoiceDto> Invoices { get; set; } = new();
            public List<AnnouncementDto> Announcements { get; set; } = new();
            public List<SupportTicketDto> Tickets { get; set; } = new();
            public List<AssignmentDto> Assignments { get; set; } = new();
            public List<AttendanceSummaryDto> AttendanceRecords { get; set; } = new();
            public List<ScholarshipAwardDto> Scholarships { get; set; } = new();
            public List<CampusEventDto> Events { get; set; } = new();
            public List<AuditLogDto> AuditLogs { get; set; } = new();
        }

        private static string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes);
        }

        private static DateTime ParseUtcDate(string? dateStr)
        {
            if (!string.IsNullOrWhiteSpace(dateStr) && DateTime.TryParse(dateStr, out var dt))
                return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
            return new DateTime(2006, 5, 15, 0, 0, 0, DateTimeKind.Utc);
        }

        private static void WriteAuditLog(PortalState state, string actor, string action, string target, string detail)
        {
            state.AuditLogs.Insert(0, new AuditLogDto
            {
                Id = "LOG-" + DateTime.Now.ToString("HHmmssfff"),
                Actor = actor,
                Action = action,
                Target = target,
                Detail = detail,
                Timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            });
            if (state.AuditLogs.Count > 250)
            {
                state.AuditLogs.RemoveRange(250, state.AuditLogs.Count - 250);
            }
        }

        private static PortalState SeedInitial500Students()
        {
            var state = new PortalState();

            state.Teachers = new List<TeacherRecordDto>
            {
                new() { Id = "GV-IT01", FullName = "Dr. Nguyen Van Minh", Email = "minh.tv@unit.edu.vn", Department = "Information Technology", Phone = "0901112201" },
                new() { Id = "GV-IT02", FullName = "MSc. Tran Hoang Nam", Email = "nam.th@unit.edu.vn", Department = "Information Technology", Phone = "0901112202" },
                new() { Id = "GV-MKT01", FullName = "Dr. Le Thi Thu Ha", Email = "ha.ltt@unit.edu.vn", Department = "Marketing", Phone = "0901112203" },
                new() { Id = "GV-MKT02", FullName = "MSc. Pham Quoc Bao", Email = "bao.pq@unit.edu.vn", Department = "Marketing", Phone = "0901112204" },
                new() { Id = "GV-GD01", FullName = "MFA. Vo Minh Tuan", Email = "tuan.vm@unit.edu.vn", Department = "Graphic Design", Phone = "0901112205" },
                new() { Id = "GV-GD02", FullName = "MDes. Dang Ngoc Lan", Email = "lan.dn@unit.edu.vn", Department = "Graphic Design", Phone = "0901112206" }
            };

            state.Classes = new List<ClassSectionDto>
            {
                new() { Id = "IT-K26A1", Name = "Software Engineering K26 - A1", Department = "Information Technology", LecturerId = "GV-IT01", LecturerName = "Dr. Nguyen Van Minh", MaxCapacity = 30 },
                new() { Id = "IT-K26A2", Name = "Software Engineering K26 - A2", Department = "Information Technology", LecturerId = "GV-IT01", LecturerName = "Dr. Nguyen Van Minh", MaxCapacity = 30 },
                new() { Id = "IT-K26A3", Name = "Cybersecurity & Cloud K26 - A3", Department = "Information Technology", LecturerId = "GV-IT01", LecturerName = "Dr. Nguyen Van Minh", MaxCapacity = 30 },
                new() { Id = "IT-K26B1", Name = "Full-Stack Web Dev K26 - B1", Department = "Information Technology", LecturerId = "GV-IT02", LecturerName = "MSc. Tran Hoang Nam", MaxCapacity = 30 },
                new() { Id = "IT-K26B2", Name = "Data Engineering K26 - B2", Department = "Information Technology", LecturerId = "GV-IT02", LecturerName = "MSc. Tran Hoang Nam", MaxCapacity = 30 },
                new() { Id = "IT-K26B3", Name = "Mobile App Dev K26 - B3", Department = "Information Technology", LecturerId = "GV-IT02", LecturerName = "MSc. Tran Hoang Nam", MaxCapacity = 30 },

                new() { Id = "MKT-K26A1", Name = "Digital Marketing K26 - A1", Department = "Marketing", LecturerId = "GV-MKT01", LecturerName = "Dr. Le Thi Thu Ha", MaxCapacity = 30 },
                new() { Id = "MKT-K26A2", Name = "Digital Marketing K26 - A2", Department = "Marketing", LecturerId = "GV-MKT01", LecturerName = "Dr. Le Thi Thu Ha", MaxCapacity = 30 },
                new() { Id = "MKT-K26A3", Name = "Brand Strategy K26 - A3", Department = "Marketing", LecturerId = "GV-MKT01", LecturerName = "Dr. Le Thi Thu Ha", MaxCapacity = 30 },
                new() { Id = "MKT-K26B1", Name = "Performance & SEO K26 - B1", Department = "Marketing", LecturerId = "GV-MKT02", LecturerName = "MSc. Pham Quoc Bao", MaxCapacity = 30 },
                new() { Id = "MKT-K26B2", Name = "Content & Social Media K26 - B2", Department = "Marketing", LecturerId = "GV-MKT02", LecturerName = "MSc. Pham Quoc Bao", MaxCapacity = 30 },
                new() { Id = "MKT-K26B3", Name = "Market Analytics K26 - B3", Department = "Marketing", LecturerId = "GV-MKT02", LecturerName = "MSc. Pham Quoc Bao", MaxCapacity = 30 },

                new() { Id = "GD-K26A1", Name = "UI/UX Product Design K26 - A1", Department = "Graphic Design", LecturerId = "GV-GD01", LecturerName = "MFA. Vo Minh Tuan", MaxCapacity = 30 },
                new() { Id = "GD-K26A2", Name = "UI/UX Product Design K26 - A2", Department = "Graphic Design", LecturerId = "GV-GD01", LecturerName = "MFA. Vo Minh Tuan", MaxCapacity = 30 },
                new() { Id = "GD-K26A3", Name = "Brand Identity Design K26 - A3", Department = "Graphic Design", LecturerId = "GV-GD01", LecturerName = "MFA. Vo Minh Tuan", MaxCapacity = 30 },
                new() { Id = "GD-K26B1", Name = "2D & Motion Graphics K26 - B1", Department = "Graphic Design", LecturerId = "GV-GD02", LecturerName = "MDes. Dang Ngoc Lan", MaxCapacity = 30 },
                new() { Id = "GD-K26B2", Name = "3D Modeling & Visual K26 - B2", Department = "Graphic Design", LecturerId = "GV-GD02", LecturerName = "MDes. Dang Ngoc Lan", MaxCapacity = 30 },
                new() { Id = "GD-K26B3", Name = "Digital Illustration K26 - B3", Department = "Graphic Design", LecturerId = "GV-GD02", LecturerName = "MDes. Dang Ngoc Lan", MaxCapacity = 30 }
            };

            state.Courses = new List<CourseRecordDto>
            {
                new() { Id = "IT101", Name = "ASP.NET Core & Web Architecture", Credits = 3, Department = "Information Technology" },
                new() { Id = "IT202", Name = "Database Systems & PostgreSQL", Credits = 3, Department = "Information Technology" },
                new() { Id = "MKT101", Name = "Digital Marketing & SEO Strategy", Credits = 3, Department = "Marketing" },
                new() { Id = "MKT202", Name = "Consumer Behavior & Brand Analytics", Credits = 3, Department = "Marketing" },
                new() { Id = "GD101", Name = "Typography & Visual Communication", Credits = 3, Department = "Graphic Design" },
                new() { Id = "GD202", Name = "Interactive UI/UX Prototyping", Credits = 3, Department = "Graphic Design" }
            };

            string[] lastNames = { "Nguyen", "Tran", "Le", "Pham", "Hoang", "Huynh", "Phan", "Vu", "Vo", "Dang", "Bui", "Do", "Ho", "Ngo", "Duong" };
            string[] midNames = { "Van", "Thi", "Minh", "Hoang", "Ngoc", "Thanh", "Quoc", "Gia", "Anh", "Khanh" };
            string[] firstNames = { "An", "Binh", "Chau", "Dung", "Duy", "Giang", "Ha", "Hai", "Hieu", "Huy", "Khoa", "Linh", "Long", "Mai", "Nam", "Nga", "Nhi", "Phong", "Phuc", "Quynh", "Son", "Tam", "Thao", "Trang", "Tuan", "Vy", "Yen" };

            int studentCounter = 1;
            for (int cIdx = 0; cIdx < state.Classes.Count; cIdx++)
            {
                var cls = state.Classes[cIdx];
                int targetSize = cIdx < 14 ? 28 : 27;

                for (int s = 0; s < targetSize; s++)
                {
                    string stId = $"SV26{studentCounter:D3}";
                    string fullName = studentCounter == 1
                        ? "Nguyen Thi Mai"
                        : $"{lastNames[(studentCounter * 3) % lastNames.Length]} {midNames[(studentCounter * 7) % midNames.Length]} {firstNames[(studentCounter * 11) % firstNames.Length]}";

                    string email = studentCounter == 1
                        ? "an.nv@unit.edu.vn"
                        : $"sv26{studentCounter:D3}@unit.edu.vn";

                    double gpa = Math.Round(2.6 + ((studentCounter * 17) % 140) / 100.0, 2);

                    state.Students.Add(new StudentRecordDto
                    {
                        Id = stId,
                        FullName = fullName,
                        Email = email,
                        Major = cls.Department,
                        ClassId = cls.Id,
                        DateOfBirth = $"2006-{((studentCounter % 12) + 1):D2}-{((studentCounter % 27) + 1):D2}",
                        Gpa = gpa,
                        Status = "Active"
                    });

                    studentCounter++;
                }
            }

            state.Accounts.Add(new UserAccountDto { Email = "admin@unit.edu.vn", PasswordHash = HashPassword("Admin@123"), FullName = "System Administrator", Role = "Admin", UserCode = "ADM01" });
            state.Accounts.Add(new UserAccountDto { Email = "minh.tv@unit.edu.vn", PasswordHash = HashPassword("Teacher@123"), FullName = "Dr. Nguyen Van Minh", Role = "Teacher", UserCode = "GV-IT01", Major = "Information Technology" });
            state.Accounts.Add(new UserAccountDto { Email = "an.nv@unit.edu.vn", PasswordHash = HashPassword("Student@123"), FullName = "Nguyen Thi Mai", Role = "Student", UserCode = "SV26001", Major = "Information Technology" });

            state.Invoices.Add(new TuitionInvoiceDto
            {
                Id = "INV-2026-01",
                StudentEmail = "ALL",
                Semester = "Fall Semester (2026 - 2027)",
                Credits = 15,
                AmountVnd = 12500000,
                Note = "Tuition Fee Fall 2026 - Unit University",
                BankCode = "MB",
                AccountNo = "0865156242",
                AccountName = "DUONG THI KIM YEN",
                Paid = false,
                CreatedAt = "2026-11-22 08:00"
            });

            state.Announcements.Add(new AnnouncementDto
            {
                Id = "NOTIF-01",
                Category = "Tuition",
                TargetGroup = "Students",
                Title = "Fall 2026 Tuition Fee Notice & QR Payment",
                Message = "Please scan the attached VietQR code (MB Bank • 0865156242 • DUONG THI KIM YEN) to complete your Fall 2026 tuition payment.",
                InvoiceId = "INV-2026-01",
                AmountVnd = 12500000,
                CreatedAt = "2026-11-22 08:00"
            });

            state.Tickets.Add(new SupportTicketDto
            {
                Id = "REQ-1122-0900",
                StudentId = "SV26001",
                StudentName = "Nguyen Thi Mai",
                StudentEmail = "an.nv@unit.edu.vn",
                Category = "Profile Record Update",
                Subject = "Update personal phone number",
                Description = "Dear Admin, please update my contact phone number to 0909888777 for academic notifications.",
                Status = "Pending",
                CreatedAt = "2026-11-22 09:00"
            });

            state.Assignments.Add(new AssignmentDto
            {
                Id = "ASM-IT01",
                ClassId = "IT-K26A1",
                CourseName = "ASP.NET Core & Web Architecture",
                LecturerName = "Dr. Nguyen Van Minh",
                Title = "Lab 01: Clean Architecture RESTful API & PostgreSQL",
                Description = "Submit your GitHub repository link or ZIP archive implementing 4-layer architecture (Domain, Application, Infrastructure, API).",
                DueDate = "2026-12-05 23:59",
                CreatedAt = "2026-11-22 08:30"
            });

            state.Assignments.Add(new AssignmentDto
            {
                Id = "ASM-MKT01",
                ClassId = "MKT-K26A1",
                CourseName = "Digital Marketing & SEO Strategy",
                LecturerName = "Dr. Le Thi Thu Ha",
                Title = "Project 01: Omnichannel Campaign & SEO Audit Plan",
                Description = "Upload PDF report or Google Drive link analyzing keyword funnel and social conversion metrics.",
                DueDate = "2026-12-06 23:59",
                CreatedAt = "2026-11-22 08:30"
            });

            state.Assignments.Add(new AssignmentDto
            {
                Id = "ASM-GD01",
                ClassId = "GD-K26A1",
                CourseName = "Interactive UI/UX Prototyping",
                LecturerName = "MFA. Vo Minh Tuan",
                Title = "Studio 01: Design System & High-Fidelity Figma Prototype",
                Description = "Submit your Figma prototype link or exported UI mockup PDF.",
                DueDate = "2026-12-07 23:59",
                CreatedAt = "2026-11-22 08:30"
            });

            state.Events.Add(new CampusEventDto
            {
                Id = "EVT-2026-01",
                Title = "Unit University Tech & Cybersecurity Hackathon 2026",
                Organizer = "IT Faculty & Cyber Club",
                EventDate = "2026-10-18 08:30",
                Venue = "Grand Hall A • Quang Trung Campus",
                ConductPoints = 10,
                Status = "Completed",
                Attendees = new List<EventAttendeeDto>
                {
                    new() { StudentId = "SV26001", StudentName = "Nguyen Thi Mai", StudentEmail = "an.nv@unit.edu.vn", ClassId = "IT-K26A1", CheckedInAt = "2026-10-18 08:25", PointsEarned = 10 }
                }
            });

            state.Events.Add(new CampusEventDto
            {
                Id = "EVT-2026-02",
                Title = "B-LEADONE Inter-Faculty Debate Championship",
                Organizer = "Student Union & A-Flamingo Club",
                EventDate = "2026-11-07 13:30",
                Venue = "Building P Auditorium",
                ConductPoints = 8,
                Status = "Completed",
                Attendees = new List<EventAttendeeDto>
                {
                    new() { StudentId = "SV26001", StudentName = "Nguyen Thi Mai", StudentEmail = "an.nv@unit.edu.vn", ClassId = "IT-K26A1", CheckedInAt = "2026-11-07 13:20", PointsEarned = 8 }
                }
            });

            state.Events.Add(new CampusEventDto
            {
                Id = "EVT-2026-03",
                Title = "Career Fair & AI Industry Networking Day",
                Organizer = "Corporate Relations Office",
                EventDate = "2026-12-10 09:00",
                Venue = "Main Exhibition Hall",
                ConductPoints = 10,
                Status = "Upcoming"
            });

            WriteAuditLog(state, "System Kernel", "SYSTEM_INIT", "PostgreSQL", "Initialized 500 students across 3 faculties (IT, Marketing, Graphic Design) and 18 class sections.");

            return state;
        }

        private AppDbContext? ResolveAppDbContext()
        {
            return _serviceProvider.GetService(typeof(AppDbContext)) as AppDbContext;
        }

        private PortalState LoadState()
        {
            lock (_lock)
            {
                var db = ResolveAppDbContext();
                if (db == null)
                    return SeedInitial500Students();

                db.Database.EnsureCreated();

                if (!db.Students.Any())
                {
                    var initial = SeedInitial500Students();
                    SaveState(initial);
                    return initial;
                }

                var classMap = db.ClassSections.AsNoTracking().ToDictionary(c => c.Id, c => c.Department, StringComparer.OrdinalIgnoreCase);

                var profileByEmailEarly = db.StudentProfiles.AsNoTracking()
    .ToDictionary(p => p.Email, p => p.Major, StringComparer.OrdinalIgnoreCase);

                var state = new PortalState
                {
                    Students = db.Students.AsNoTracking().Select(s => new StudentRecordDto
                    {
                        Id = s.Id,
                        FullName = s.FullName,
                        Email = s.Email,
                        Major = "Information Technology",
                        ClassId = "IT-K26A1",
                        DateOfBirth = s.DateOfBirth.ToString("yyyy-MM-dd"),
                        Gpa = s.Gpa,
                        Status = "Active"
                    }).ToList(),

                    Teachers = db.Teachers.AsNoTracking().Select(t => new TeacherRecordDto
                    {
                        Id = t.Id,
                        FullName = t.FullName,
                        Email = t.Email,
                        Department = t.Department,
                        Phone = t.PhoneNumber
                    }).ToList(),

                    Classes = db.ClassSections.AsNoTracking().Select(c => new ClassSectionDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Department = c.Department,
                        LecturerId = c.LecturerId,
                        LecturerName = c.LecturerName,
                        MaxCapacity = c.MaxCapacity,
                        Status = c.Status
                    }).ToList(),

                    Courses = db.Courses.AsNoTracking().Select(c => new CourseRecordDto
                    {
                        Id = c.Id,
                        Name = c.Title,
                        Credits = c.Credits,
                        Department = c.LecturerName
                    }).ToList(),

                    Accounts = db.UserAccounts.AsNoTracking().Select(a => new UserAccountDto
                    {
                        Email = a.Username,
                        PasswordHash = a.PasswordHash,
                        FullName = a.FullName,
                        Role = a.Role,
                        UserCode = "",
                        Major = ""
                    }).ToList(),

                    Profiles = db.StudentProfiles.AsNoTracking().Select(p => new StudentProfileDto
                    {
                        Email = p.Email,
                        StudentId = p.StudentId,
                        FullName = p.FullName,
                        Phone = p.Phone,
                        Major = p.Major,
                        AvatarBase64 = p.AvatarBase64
                    }).ToList(),

                    Invoices = db.TuitionInvoices.AsNoTracking().Select(i => new TuitionInvoiceDto
                    {
                        Id = i.Id,
                        StudentEmail = i.StudentEmail,
                        Semester = i.Semester,
                        Credits = i.Credits,
                        AmountVnd = i.AmountVnd,
                        Note = i.Note,
                        BankCode = i.BankCode,
                        AccountNo = i.AccountNo,
                        AccountName = i.AccountName,
                        Paid = i.Paid,
                        CreatedAt = i.CreatedAt,
                        RecipientEmails = JsonSerializer.Deserialize<List<string>>(i.RecipientEmailsJson) ?? new()
                    }).ToList(),

                    Announcements = db.Announcements.AsNoTracking().Select(a => new AnnouncementDto
                    {
                        Id = a.Id,
                        Category = a.Category,
                        TargetGroup = a.TargetGroup,
                        TargetClassIds = JsonSerializer.Deserialize<List<string>>(a.TargetClassIdsJson) ?? new(),
                        Title = a.Title,
                        Message = a.Message,
                        InvoiceId = a.InvoiceId,
                        AmountVnd = a.AmountVnd,
                        CreatedAt = a.CreatedAt
                    }).ToList(),

                    Tickets = db.SupportTickets.AsNoTracking().Select(t => new SupportTicketDto
                    {
                        Id = t.Id,
                        StudentId = t.StudentId,
                        StudentName = t.StudentName,
                        StudentEmail = t.StudentEmail,
                        Category = t.Category,
                        Subject = t.Subject,
                        Description = t.Description,
                        Status = t.Status,
                        AdminReply = t.AdminReply,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt
                    }).ToList(),

                    Assignments = db.PortalAssignments.AsNoTracking().Select(a => new AssignmentDto
                    {
                        Id = a.Id,
                        ClassId = a.ClassId,
                        CourseName = a.CourseName,
                        LecturerName = a.LecturerName,
                        Title = a.Title,
                        Description = a.Description,
                        DueDate = a.DueDate,
                        CreatedAt = a.CreatedAt,
                        Submissions = JsonSerializer.Deserialize<List<SubmissionDto>>(a.SubmissionsJson) ?? new()
                    }).ToList(),

                    AttendanceRecords = db.AttendanceSummaries.AsNoTracking().Select(r => new AttendanceSummaryDto
                    {
                        StudentId = r.StudentId,
                        StudentName = r.StudentName,
                        ClassId = r.ClassId,
                        TotalSessions = r.TotalSessions,
                        AttendedSessions = r.AttendedSessions,
                        AbsentSessions = r.AbsentSessions,
                        UpdatedBy = r.UpdatedBy,
                        UpdatedAt = r.UpdatedAt
                    }).ToList(),

                    Scholarships = db.ScholarshipAwards.AsNoTracking().Select(sc => new ScholarshipAwardDto
                    {
                        StudentId = sc.StudentId,
                        StudentName = sc.StudentName,
                        Major = sc.Major,
                        ClassId = sc.ClassId,
                        Gpa = sc.Gpa,
                        Tier = sc.Tier,
                        WaiverAmountVnd = sc.WaiverAmountVnd,
                        AwardedAt = sc.AwardedAt
                    }).ToList(),

                    Events = db.CampusEvents.AsNoTracking().Select(e => new CampusEventDto
                    {
                        Id = e.Id,
                        Title = e.Title,
                        Organizer = e.Organizer,
                        EventDate = e.EventDate,
                        Venue = e.Venue,
                        ConductPoints = e.ConductPoints,
                        Status = e.Status,
                        Attendees = JsonSerializer.Deserialize<List<EventAttendeeDto>>(e.AttendeesJson) ?? new()
                    }).ToList(),

                    AuditLogs = db.AuditLogs.AsNoTracking().Select(l => new AuditLogDto
                    {
                        Id = l.Id,
                        Actor = l.Actor,
                        Action = l.Action,
                        Target = l.Target,
                        Detail = l.Detail,
                        Timestamp = l.Timestamp
                    }).ToList()
                };

                // Khôi phục ClassId & Major của sinh viên nếu có lưu trong StudentProfiles
                var profileByEmail = state.Profiles.ToDictionary(p => p.Email, p => p, StringComparer.OrdinalIgnoreCase);
                foreach (var st in state.Students)
                {
                    if (profileByEmail.TryGetValue(st.Email, out var prof) && !string.IsNullOrWhiteSpace(prof.Major))
                    {
                        var parts = prof.Major.Split("• Class ");
                        st.Major = parts[0].Trim();
                        if (parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]))
                            st.ClassId = parts[1].Trim();
                    }
                }

                // Khôi phục UserCode & Major của tài khoản nếu có
                var studentByEmail = state.Students.ToDictionary(s => s.Email, s => s, StringComparer.OrdinalIgnoreCase);
                var teacherByEmail = state.Teachers.ToDictionary(t => t.Email, t => t, StringComparer.OrdinalIgnoreCase);
                foreach (var acc in state.Accounts)
                {
                    if (studentByEmail.TryGetValue(acc.Email, out var s))
                    {
                        acc.UserCode = s.Id;
                        acc.Major = s.Major;
                    }
                    else if (teacherByEmail.TryGetValue(acc.Email, out var t))
                    {
                        acc.UserCode = t.Id;
                        acc.Major = t.Department;
                    }
                }

                return state;
            }
        }

        private void SaveState(PortalState state)
        {
            lock (_lock)
            {
                var db = ResolveAppDbContext();
                if (db == null) return;

                db.Database.EnsureCreated();

                // 1. Students
                var existingStudents = db.Students.ToDictionary(s => s.Id);
                var incomingStudentIds = state.Students.Select(s => s.Id).ToHashSet();
                foreach (var removed in existingStudents.Values.Where(s => !incomingStudentIds.Contains(s.Id)).ToList())
                    db.Students.Remove(removed);

                foreach (var dto in state.Students)
                {
                    var dob = ParseUtcDate(dto.DateOfBirth);
                    if (existingStudents.TryGetValue(dto.Id, out var ent))
                    {
                        ent.FullName = dto.FullName;
                        ent.Email = dto.Email;
                        ent.DateOfBirth = dob;
                        ent.Gpa = dto.Gpa;
                    }
                    else
                    {
                        db.Students.Add(new Student
                        {
                            Id = dto.Id,
                            FullName = dto.FullName,
                            Email = dto.Email,
                            DateOfBirth = dob,
                            Gpa = dto.Gpa
                        });
                    }
                }

                // 2. Teachers
                var existingTeachers = db.Teachers.ToDictionary(t => t.Id);
                var incomingTeacherIds = state.Teachers.Select(t => t.Id).ToHashSet();
                foreach (var removed in existingTeachers.Values.Where(t => !incomingTeacherIds.Contains(t.Id)).ToList())
                    db.Teachers.Remove(removed);

                foreach (var dto in state.Teachers)
                {
                    if (existingTeachers.TryGetValue(dto.Id, out var ent))
                    {
                        ent.FullName = dto.FullName;
                        ent.Email = dto.Email;
                        ent.Department = dto.Department;
                        ent.PhoneNumber = dto.Phone;
                    }
                    else
                    {
                        db.Teachers.Add(new Teacher
                        {
                            Id = dto.Id,
                            FullName = dto.FullName,
                            Email = dto.Email,
                            Department = dto.Department,
                            PhoneNumber = dto.Phone
                        });
                    }
                }

                // 3. Courses
                var existingCourses = db.Courses.ToDictionary(c => c.Id);
                foreach (var dto in state.Courses)
                {
                    if (existingCourses.TryGetValue(dto.Id, out var ent))
                    {
                        ent.Title = dto.Name;
                        ent.Credits = dto.Credits;
                        ent.LecturerName = dto.Department;
                    }
                    else
                    {
                        db.Courses.Add(new Course
                        {
                            Id = dto.Id,
                            Title = dto.Name,
                            Credits = dto.Credits,
                            LecturerName = dto.Department,
                            Status = "Đang mở lớp"
                        });
                    }
                }

                // 4. UserAccounts
                var existingAccounts = db.UserAccounts.ToDictionary(a => a.Username, StringComparer.OrdinalIgnoreCase);
                foreach (var dto in state.Accounts)
                {
                    if (existingAccounts.TryGetValue(dto.Email, out var ent))
                    {
                        ent.PasswordHash = dto.PasswordHash;
                        ent.FullName = dto.FullName;
                        ent.Role = dto.Role;
                    }
                    else
                    {
                        db.UserAccounts.Add(new UserAccount
                        {
                            Username = dto.Email,
                            PasswordHash = dto.PasswordHash,
                            FullName = dto.FullName,
                            Role = dto.Role
                        });
                    }
                }

                // 5. ClassSections
                var existingClasses = db.ClassSections.ToDictionary(c => c.Id);
                foreach (var dto in state.Classes)
                {
                    if (existingClasses.TryGetValue(dto.Id, out var ent))
                    {
                        ent.Name = dto.Name;
                        ent.Department = dto.Department;
                        ent.LecturerId = dto.LecturerId;
                        ent.LecturerName = dto.LecturerName;
                        ent.MaxCapacity = dto.MaxCapacity;
                        ent.Status = dto.Status;
                    }
                    else
                    {
                        db.ClassSections.Add(new ClassSection
                        {
                            Id = dto.Id,
                            Name = dto.Name,
                            Department = dto.Department,
                            LecturerId = dto.LecturerId,
                            LecturerName = dto.LecturerName,
                            MaxCapacity = dto.MaxCapacity,
                            Status = dto.Status
                        });
                    }
                }

                // Đảm bảo mỗi sinh viên đều có bản ghi StudentProfile giữ ClassId & Major
                foreach (var st in state.Students)
                {
                    if (!state.Profiles.Any(p => p.Email.Equals(st.Email, StringComparison.OrdinalIgnoreCase)))
                    {
                        state.Profiles.Add(new StudentProfileDto
                        {
                            Email = st.Email,
                            StudentId = st.Id,
                            FullName = st.FullName,
                            Major = $"{st.Major} • Class {st.ClassId}"
                        });
                    }
                }

                var existingProfiles = db.StudentProfiles.ToDictionary(p => p.Email, StringComparer.OrdinalIgnoreCase);
                foreach (var dto in state.Profiles)
                {
                    if (string.IsNullOrWhiteSpace(dto.Email)) continue;
                    if (existingProfiles.TryGetValue(dto.Email, out var ent))
                    {
                        ent.StudentId = dto.StudentId;
                        ent.FullName = dto.FullName;
                        ent.Phone = dto.Phone;
                        ent.Major = dto.Major;
                        if (!string.IsNullOrEmpty(dto.AvatarBase64))
                            ent.AvatarBase64 = dto.AvatarBase64;
                    }
                    else
                    {
                        db.StudentProfiles.Add(new StudentProfile
                        {
                            Email = dto.Email,
                            StudentId = dto.StudentId,
                            FullName = dto.FullName,
                            Phone = dto.Phone,
                            Major = dto.Major,
                            AvatarBase64 = dto.AvatarBase64
                        });
                    }
                }

                // 6. TuitionInvoices
                var existingInvoices = db.TuitionInvoices.ToDictionary(i => i.Id);
                foreach (var dto in state.Invoices)
                {
                    var recJson = JsonSerializer.Serialize(dto.RecipientEmails);
                    if (existingInvoices.TryGetValue(dto.Id, out var ent))
                    {
                        ent.StudentEmail = dto.StudentEmail;
                        ent.Semester = dto.Semester;
                        ent.Credits = dto.Credits;
                        ent.AmountVnd = dto.AmountVnd;
                        ent.Note = dto.Note;
                        ent.BankCode = dto.BankCode;
                        ent.AccountNo = dto.AccountNo;
                        ent.AccountName = dto.AccountName;
                        ent.Paid = dto.Paid;
                        ent.CreatedAt = dto.CreatedAt;
                        ent.RecipientEmailsJson = recJson;
                    }
                    else
                    {
                        db.TuitionInvoices.Add(new TuitionInvoice
                        {
                            Id = dto.Id,
                            StudentEmail = dto.StudentEmail,
                            Semester = dto.Semester,
                            Credits = dto.Credits,
                            AmountVnd = dto.AmountVnd,
                            Note = dto.Note,
                            BankCode = dto.BankCode,
                            AccountNo = dto.AccountNo,
                            AccountName = dto.AccountName,
                            Paid = dto.Paid,
                            CreatedAt = dto.CreatedAt,
                            RecipientEmailsJson = recJson
                        });
                    }
                }

                // 7. Announcements
                var existingAnnouncements = db.Announcements.ToDictionary(a => a.Id);
                foreach (var dto in state.Announcements)
                {
                    var clsJson = JsonSerializer.Serialize(dto.TargetClassIds);
                    if (existingAnnouncements.TryGetValue(dto.Id, out var ent))
                    {
                        ent.Category = dto.Category;
                        ent.TargetGroup = dto.TargetGroup;
                        ent.TargetClassIdsJson = clsJson;
                        ent.Title = dto.Title;
                        ent.Message = dto.Message;
                        ent.InvoiceId = dto.InvoiceId;
                        ent.AmountVnd = dto.AmountVnd;
                        ent.CreatedAt = dto.CreatedAt;
                    }
                    else
                    {
                        db.Announcements.Add(new Announcement
                        {
                            Id = dto.Id,
                            Category = dto.Category,
                            TargetGroup = dto.TargetGroup,
                            TargetClassIdsJson = clsJson,
                            Title = dto.Title,
                            Message = dto.Message,
                            InvoiceId = dto.InvoiceId,
                            AmountVnd = dto.AmountVnd,
                            CreatedAt = dto.CreatedAt
                        });
                    }
                }

                // 8. SupportTickets
                var existingTickets = db.SupportTickets.ToDictionary(t => t.Id);
                foreach (var dto in state.Tickets)
                {
                    if (existingTickets.TryGetValue(dto.Id, out var ent))
                    {
                        ent.Status = dto.Status;
                        ent.AdminReply = dto.AdminReply;
                        ent.UpdatedAt = dto.UpdatedAt;
                    }
                    else
                    {
                        db.SupportTickets.Add(new SupportTicket
                        {
                            Id = dto.Id,
                            StudentId = dto.StudentId,
                            StudentName = dto.StudentName,
                            StudentEmail = dto.StudentEmail,
                            Category = dto.Category,
                            Subject = dto.Subject,
                            Description = dto.Description,
                            Status = dto.Status,
                            AdminReply = dto.AdminReply,
                            CreatedAt = dto.CreatedAt,
                            UpdatedAt = dto.UpdatedAt
                        });
                    }
                }

                // 9. PortalAssignments
                var existingAssignments = db.PortalAssignments.ToDictionary(a => a.Id);
                foreach (var dto in state.Assignments)
                {
                    var subJson = JsonSerializer.Serialize(dto.Submissions);
                    if (existingAssignments.TryGetValue(dto.Id, out var ent))
                    {
                        ent.ClassId = dto.ClassId;
                        ent.CourseName = dto.CourseName;
                        ent.LecturerName = dto.LecturerName;
                        ent.Title = dto.Title;
                        ent.Description = dto.Description;
                        ent.DueDate = dto.DueDate;
                        ent.CreatedAt = dto.CreatedAt;
                        ent.SubmissionsJson = subJson;
                    }
                    else
                    {
                        db.PortalAssignments.Add(new PortalAssignment
                        {
                            Id = dto.Id,
                            ClassId = dto.ClassId,
                            CourseName = dto.CourseName,
                            LecturerName = dto.LecturerName,
                            Title = dto.Title,
                            Description = dto.Description,
                            DueDate = dto.DueDate,
                            CreatedAt = dto.CreatedAt,
                            SubmissionsJson = subJson
                        });
                    }
                }

                // 10. AttendanceSummaries
                var existingAttendance = db.AttendanceSummaries.ToList();
                foreach (var dto in state.AttendanceRecords)
                {
                    var ent = existingAttendance.FirstOrDefault(x => x.StudentId == dto.StudentId && x.ClassId == dto.ClassId);
                    if (ent != null)
                    {
                        ent.StudentName = dto.StudentName;
                        ent.TotalSessions = dto.TotalSessions;
                        ent.AttendedSessions = dto.AttendedSessions;
                        ent.AbsentSessions = dto.AbsentSessions;
                        ent.UpdatedBy = dto.UpdatedBy;
                        ent.UpdatedAt = dto.UpdatedAt;
                    }
                    else
                    {
                        db.AttendanceSummaries.Add(new AttendanceSummary
                        {
                            StudentId = dto.StudentId,
                            StudentName = dto.StudentName,
                            ClassId = dto.ClassId,
                            TotalSessions = dto.TotalSessions,
                            AttendedSessions = dto.AttendedSessions,
                            AbsentSessions = dto.AbsentSessions,
                            UpdatedBy = dto.UpdatedBy,
                            UpdatedAt = dto.UpdatedAt
                        });
                    }
                }

                // 11. ScholarshipAwards
                var existingScholarships = db.ScholarshipAwards.ToDictionary(s => s.StudentId);
                var incomingScholarshipIds = state.Scholarships.Select(s => s.StudentId).ToHashSet();
                foreach (var removed in existingScholarships.Values.Where(s => !incomingScholarshipIds.Contains(s.StudentId)).ToList())
                    db.ScholarshipAwards.Remove(removed);

                foreach (var dto in state.Scholarships)
                {
                    if (existingScholarships.TryGetValue(dto.StudentId, out var ent))
                    {
                        ent.StudentName = dto.StudentName;
                        ent.Major = dto.Major;
                        ent.ClassId = dto.ClassId;
                        ent.Gpa = dto.Gpa;
                        ent.Tier = dto.Tier;
                        ent.WaiverAmountVnd = dto.WaiverAmountVnd;
                        ent.AwardedAt = dto.AwardedAt;
                    }
                    else
                    {
                        db.ScholarshipAwards.Add(new ScholarshipAward
                        {
                            StudentId = dto.StudentId,
                            StudentName = dto.StudentName,
                            Major = dto.Major,
                            ClassId = dto.ClassId,
                            Gpa = dto.Gpa,
                            Tier = dto.Tier,
                            WaiverAmountVnd = dto.WaiverAmountVnd,
                            AwardedAt = dto.AwardedAt
                        });
                    }
                }

                // 12. CampusEvents
                var existingEvents = db.CampusEvents.ToDictionary(e => e.Id);
                foreach (var dto in state.Events)
                {
                    var attJson = JsonSerializer.Serialize(dto.Attendees);
                    if (existingEvents.TryGetValue(dto.Id, out var ent))
                    {
                        ent.Title = dto.Title;
                        ent.Organizer = dto.Organizer;
                        ent.EventDate = dto.EventDate;
                        ent.Venue = dto.Venue;
                        ent.ConductPoints = dto.ConductPoints;
                        ent.Status = dto.Status;
                        ent.AttendeesJson = attJson;
                    }
                    else
                    {
                        db.CampusEvents.Add(new CampusEvent
                        {
                            Id = dto.Id,
                            Title = dto.Title,
                            Organizer = dto.Organizer,
                            EventDate = dto.EventDate,
                            Venue = dto.Venue,
                            ConductPoints = dto.ConductPoints,
                            Status = dto.Status,
                            AttendeesJson = attJson
                        });
                    }
                }

                // 13. AuditLogs
                var existingLogs = db.AuditLogs.ToDictionary(l => l.Id);
                foreach (var dto in state.AuditLogs)
                {
                    if (!existingLogs.ContainsKey(dto.Id))
                    {
                        db.AuditLogs.Add(new AuditLog
                        {
                            Id = dto.Id,
                            Actor = dto.Actor,
                            Action = dto.Action,
                            Target = dto.Target,
                            Detail = dto.Detail,
                            Timestamp = dto.Timestamp
                        });
                    }
                }

                db.SaveChanges();
            }
        }

        private async Task<int> DispatchEmailsAsync(IEnumerable<string> emails, string subject, string htmlBody)
        {
            var emailServiceType = AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(a => { try { return a.GetTypes(); } catch { return Array.Empty<Type>(); } })
                .FirstOrDefault(t => t.IsInterface && t.Name == "IEmailService");

            var emailService = emailServiceType != null ? _serviceProvider.GetService(emailServiceType) : null;
            var sendMethod = emailServiceType?.GetMethod("SendEmailAsync", new[] { typeof(string), typeof(string), typeof(string) });

            if (emailService == null || sendMethod == null) return 0;

            int sent = 0;
            foreach (var email in emails.Where(e => !string.IsNullOrWhiteSpace(e)).Distinct())
            {
                try
                {
                    if (sendMethod.Invoke(emailService, new object[] { email.Trim(), subject, htmlBody }) is Task task)
                    {
                        await task;
                        sent++;
                    }
                }
                catch { }
            }
            return sent;
        }

        [HttpPost("auth/register")]
        public async Task<IActionResult> RegisterRealAccount([FromBody] AuthRegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.FullName))
                return BadRequest(new { message = "Please fill in Full Name, Email, and Password." });

            var state = LoadState();
            if (state.Accounts.Any(a => a.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase)))
                return BadRequest(new { message = "This email is already registered!" });

            string assignedCode = dto.UserCode.Trim();
            if (string.IsNullOrWhiteSpace(assignedCode))
            {
                assignedCode = dto.Role == "Teacher"
                    ? $"GV{(state.Teachers.Count + 1):D3}"
                    : $"SV26{(state.Students.Count + 1):D3}";
            }

            state.Accounts.Add(new UserAccountDto
            {
                Email = dto.Email.Trim(),
                PasswordHash = HashPassword(dto.Password),
                FullName = dto.FullName.Trim(),
                Role = dto.Role,
                UserCode = assignedCode,
                Major = dto.Major
            });

            if (dto.Role == "Teacher")
            {
                state.Teachers.Insert(0, new TeacherRecordDto
                {
                    Id = assignedCode,
                    FullName = dto.FullName.Trim(),
                    Email = dto.Email.Trim(),
                    Department = string.IsNullOrWhiteSpace(dto.Major) ? "Information Technology" : dto.Major,
                    Phone = string.IsNullOrWhiteSpace(dto.Phone) ? "0901234567" : dto.Phone
                });
            }
            else
            {
                string major = string.IsNullOrWhiteSpace(dto.Major) ? "Information Technology" : dto.Major;
                var targetClass = state.Classes.FirstOrDefault(c =>
                    c.Department.Equals(major, StringComparison.OrdinalIgnoreCase) &&
                    state.Students.Count(s => s.ClassId == c.Id) < c.MaxCapacity)
                    ?? state.Classes.First();

                state.Students.Insert(0, new StudentRecordDto
                {
                    Id = assignedCode,
                    FullName = dto.FullName.Trim(),
                    Email = dto.Email.Trim(),
                    Major = major,
                    ClassId = targetClass.Id,
                    Gpa = 3.50,
                    Status = "Active"
                });

                state.Profiles.Add(new StudentProfileDto
                {
                    Email = dto.Email.Trim(),
                    StudentId = assignedCode,
                    FullName = dto.FullName.Trim(),
                    Phone = string.IsNullOrWhiteSpace(dto.Phone) ? "0901234567" : dto.Phone,
                    Major = $"{major} • Class {targetClass.Id}"
                });
            }

            WriteAuditLog(state, dto.Email.Trim(), "ACCOUNT_REGISTER", assignedCode, $"Registered new {dto.Role} account ({dto.FullName.Trim()}).");
            SaveState(state);

            await DispatchEmailsAsync(
                new[] { dto.Email.Trim() },
                "[Unit University] Welcome to SIMS Portal",
                $"<h3>Welcome, {dto.FullName}!</h3><p>Your account (<strong>{assignedCode}</strong> - {dto.Role}) has been created and saved to PostgreSQL.</p>"
            );

            return Ok(new { message = "Account registered successfully!", email = dto.Email.Trim(), role = dto.Role, userCode = assignedCode });
        }

        [HttpPost("auth/login")]
        public IActionResult LoginRealAccount([FromBody] AuthLoginDto dto)
        {
            var state = LoadState();
            var acc = state.Accounts.FirstOrDefault(a => a.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase));
            if (acc == null || acc.PasswordHash != HashPassword(dto.Password))
                return Unauthorized(new { message = "Incorrect email or password!" });

            return Ok(new
            {
                email = acc.Email,
                fullName = acc.FullName,
                role = acc.Role,
                userCode = acc.UserCode,
                major = acc.Major
            });
        }

        [HttpGet("state")]
        public IActionResult GetState([FromQuery] string? email)
        {
            var state = LoadState();
            var studentRec = state.Students.FirstOrDefault(s => s.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
            var profile = state.Profiles.FirstOrDefault(p => p.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
                          ?? new StudentProfileDto
                          {
                              Email = email ?? "an.nv@unit.edu.vn",
                              StudentId = studentRec?.Id ?? "SV26001",
                              FullName = studentRec?.FullName ?? "Nguyen Thi Mai",
                              Major = studentRec != null ? $"{studentRec.Major} • Class {studentRec.ClassId}" : "Information Technology • Class IT-K26A1"
                          };

            return Ok(new
            {
                profile,
                students = state.Students,
                teachers = state.Teachers,
                classes = state.Classes.Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Department,
                    c.LecturerId,
                    c.LecturerName,
                    c.MaxCapacity,
                    EnrolledCount = state.Students.Count(s => s.ClassId == c.Id),
                    c.Status
                }),
                courses = state.Courses,
                invoices = state.Invoices.Where(i => i.StudentEmail == "ALL" || i.StudentEmail.Equals(email, StringComparison.OrdinalIgnoreCase)).ToList(),
                announcements = state.Announcements,
                tickets = state.Tickets.OrderByDescending(t => t.CreatedAt).ToList(),
                assignments = state.Assignments,
                attendanceRecords = state.AttendanceRecords,
                scholarships = state.Scholarships,
                events = state.Events,
                auditLogs = state.AuditLogs
            });
        }

        [HttpPost("sync-db")]
        public IActionResult ForceSyncDatabase()
        {
            var state = LoadState();
            WriteAuditLog(state, "System Administrator", "DB_SYNC", "PostgreSQL", $"Synchronized {state.Students.Count} students and {state.Teachers.Count} lecturers to PostgreSQL.");
            SaveState(state);
            return Ok(new { message = "Synced all records to PostgreSQL!", students = state.Students.Count, teachers = state.Teachers.Count });
        }

        [HttpPost("students")]
        public IActionResult AddStudent([FromBody] StudentRecordDto dto)
        {
            var state = LoadState();
            int currentInClass = state.Students.Count(s => s.ClassId == dto.ClassId);
            var cls = state.Classes.FirstOrDefault(c => c.Id == dto.ClassId);
            if (cls != null && currentInClass >= cls.MaxCapacity)
                return BadRequest(new { message = $"Class {cls.Id} is full ({cls.MaxCapacity}/{cls.MaxCapacity} students)!" });

            if (string.IsNullOrWhiteSpace(dto.Id))
                dto.Id = $"SV26{(state.Students.Count + 1):D3}";

            state.Students.Insert(0, dto);
            WriteAuditLog(state, "System Administrator", "STUDENT_CREATE", dto.Id, $"Added student {dto.FullName} to class {dto.ClassId} ({dto.Major}).");
            SaveState(state);
            return Ok(dto);
        }

        [HttpPut("students/{id}")]
        public IActionResult UpdateStudent(string id, [FromBody] StudentRecordDto dto)
        {
            var state = LoadState();
            var st = state.Students.FirstOrDefault(s => s.Id == id);
            if (st == null) return NotFound();

            if (st.ClassId != dto.ClassId)
            {
                var targetCls = state.Classes.FirstOrDefault(c => c.Id == dto.ClassId);
                if (targetCls != null && state.Students.Count(s => s.ClassId == dto.ClassId) >= targetCls.MaxCapacity)
                    return BadRequest(new { message = $"Class {targetCls.Id} already reached 30 students!" });
            }

            double oldGpa = st.Gpa;
            string oldClass = st.ClassId;

            st.FullName = dto.FullName;
            st.Email = dto.Email;
            st.Major = dto.Major;
            st.ClassId = dto.ClassId;
            st.Gpa = dto.Gpa;

            var prof = state.Profiles.FirstOrDefault(p => p.StudentId == id || p.Email.Equals(dto.Email, StringComparison.OrdinalIgnoreCase));
            if (prof != null)
            {
                prof.FullName = dto.FullName;
                prof.Email = dto.Email;
                prof.Major = $"{dto.Major} • Class {dto.ClassId}";
            }

            WriteAuditLog(state, "System Administrator", "STUDENT_UPDATE", id, $"Updated {st.FullName}: Class {oldClass} -> {dto.ClassId}, GPA {oldGpa:F2} -> {dto.Gpa:F2}.");
            SaveState(state);
            return Ok(st);
        }

        [HttpDelete("students/{id}")]
        public IActionResult DeleteStudent(string id)
        {
            var state = LoadState();
            var target = state.Students.FirstOrDefault(s => s.Id == id);
            state.Students.RemoveAll(s => s.Id == id);
            WriteAuditLog(state, "System Administrator", "STUDENT_DELETE", id, $"Removed student record ({target?.FullName ?? id}).");
            SaveState(state);
            return Ok();
        }

        [HttpPost("teachers")]
        public IActionResult AddTeacher([FromBody] TeacherRecordDto dto)
        {
            var state = LoadState();
            if (string.IsNullOrWhiteSpace(dto.Id))
                dto.Id = $"GV{(state.Teachers.Count + 1):D3}";
            state.Teachers.Insert(0, dto);
            WriteAuditLog(state, "System Administrator", "LECTURER_CREATE", dto.Id, $"Added specialized lecturer {dto.FullName} ({dto.Department}).");
            SaveState(state);
            return Ok(dto);
        }

        [HttpPut("teachers/{id}")]
        public IActionResult UpdateTeacher(string id, [FromBody] TeacherRecordDto dto)
        {
            var state = LoadState();
            var t = state.Teachers.FirstOrDefault(x => x.Id == id);
            if (t == null) return NotFound();
            t.FullName = dto.FullName;
            t.Email = dto.Email;
            t.Department = dto.Department;
            t.Phone = dto.Phone;
            WriteAuditLog(state, "System Administrator", "LECTURER_UPDATE", id, $"Updated lecturer {dto.FullName} ({dto.Department}).");
            SaveState(state);
            return Ok(t);
        }

        [HttpDelete("teachers/{id}")]
        public IActionResult DeleteTeacher(string id)
        {
            var state = LoadState();
            state.Teachers.RemoveAll(x => x.Id == id);
            WriteAuditLog(state, "System Administrator", "LECTURER_DELETE", id, $"Removed lecturer {id}.");
            SaveState(state);
            return Ok();
        }

        [HttpPost("classes")]
        public IActionResult AddClass([FromBody] ClassSectionDto dto)
        {
            var state = LoadState();
            dto.MaxCapacity = dto.MaxCapacity <= 0 || dto.MaxCapacity > 30 ? 30 : dto.MaxCapacity;
            state.Classes.Insert(0, dto);
            WriteAuditLog(state, "System Administrator", "CLASS_CREATE", dto.Id, $"Created class {dto.Name} ({dto.Department}) assigned to {dto.LecturerName}.");
            SaveState(state);
            return Ok(dto);
        }

        [HttpPost("avatar")]
        public IActionResult UpdateAvatarOnly([FromBody] AvatarUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.AvatarBase64))
                return BadRequest(new { message = "Email and image data are required." });

            var state = LoadState();
            var existing = state.Profiles.FirstOrDefault(p => p.Email.Equals(dto.Email, StringComparison.OrdinalIgnoreCase));
            if (existing != null) existing.AvatarBase64 = dto.AvatarBase64;
            else state.Profiles.Add(new StudentProfileDto { Email = dto.Email, FullName = dto.DefaultName, AvatarBase64 = dto.AvatarBase64 });
            SaveState(state);
            return Ok(new { avatarBase64 = dto.AvatarBase64 });
        }

        [HttpPost("admin/publish-tuition")]
        public async Task<IActionResult> PublishTuition([FromBody] TuitionInvoiceDto invoice)
        {
            var state = LoadState();
            invoice.Id = "INV-" + DateTime.Now.ToString("yyyyMMdd-HHmmss");
            invoice.CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            invoice.BankCode = "MB";
            invoice.AccountNo = "0865156242";
            invoice.AccountName = "DUONG THI KIM YEN";
            invoice.Paid = false;
            state.Invoices.Insert(0, invoice);

            var title = $"Tuition Notice: {invoice.Semester}";
            state.Announcements.Insert(0, new AnnouncementDto
            {
                Id = "NOTIF-" + DateTime.Now.ToString("HHmmss"),
                Category = "Tuition",
                TargetGroup = "Students",
                Title = title,
                Message = $"{invoice.Note} — Amount due: {invoice.AmountVnd:N0} VND.",
                InvoiceId = invoice.Id,
                AmountVnd = invoice.AmountVnd,
                CreatedAt = invoice.CreatedAt
            });
            WriteAuditLog(state, "System Administrator", "TUITION_PUBLISH", invoice.Id, $"Issued tuition invoice {invoice.Semester} ({invoice.AmountVnd:N0} VND).");
            SaveState(state);

            var qrUrl = $"https://img.vietqr.io/image/MB-0865156242-compact2.png?amount={Math.Round(invoice.AmountVnd)}&addInfo={Uri.EscapeDataString(invoice.Id)}&accountName={Uri.EscapeDataString("DUONG THI KIM YEN")}";
            var htmlBody = $"<h2>Unit University — Tuition Fee Notice</h2><p>Semester: <strong>{invoice.Semester}</strong></p><p>Amount: <strong>{invoice.AmountVnd:N0} VND</strong></p><img src='{qrUrl}' width='220'/>";
            int emailsSent = await DispatchEmailsAsync(invoice.RecipientEmails, $"[Unit University] {title}", htmlBody);
            return Ok(new { invoice, emailsSent });
        }

        [HttpPost("admin/send-email")]
        public async Task<IActionResult> SendAcademicEmail([FromBody] EmailBroadcastDto dto)
        {
            var state = LoadState();
            var resolvedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            if (dto.TargetGroup == "Class" && dto.ClassIds.Count > 0)
            {
                var classStudents = state.Students.Where(s => dto.ClassIds.Contains(s.ClassId)).Select(s => s.Email);
                foreach (var e in classStudents) resolvedEmails.Add(e);

                if (dto.IncludeLecturer)
                {
                    var classLecIds = state.Classes.Where(c => dto.ClassIds.Contains(c.Id)).Select(c => c.LecturerId).ToHashSet();
                    var lecEmails = state.Teachers.Where(t => classLecIds.Contains(t.Id)).Select(t => t.Email);
                    foreach (var e in lecEmails) resolvedEmails.Add(e);
                }
            }
            else if (dto.TargetGroup == "Students")
            {
                foreach (var e in state.Students.Select(s => s.Email)) resolvedEmails.Add(e);
            }
            else if (dto.TargetGroup == "Lecturers")
            {
                foreach (var e in state.Teachers.Select(t => t.Email)) resolvedEmails.Add(e);
            }
            else if (dto.TargetGroup == "All")
            {
                foreach (var e in state.Students.Select(s => s.Email)) resolvedEmails.Add(e);
                foreach (var e in state.Teachers.Select(t => t.Email)) resolvedEmails.Add(e);
            }
            else
            {
                foreach (var e in dto.RecipientEmails) resolvedEmails.Add(e);
            }

            string targetLabel = dto.TargetGroup == "Class" && dto.ClassIds.Count > 0
                ? $"Classes: {string.Join(", ", dto.ClassIds)} ({resolvedEmails.Count} recipients)"
                : dto.TargetGroup;

            state.Announcements.Insert(0, new AnnouncementDto
            {
                Id = "MAIL-" + DateTime.Now.ToString("HHmmss"),
                Category = dto.Category,
                TargetGroup = targetLabel,
                TargetClassIds = dto.ClassIds,
                Title = dto.Subject,
                Message = dto.Body,
                CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm")
            });
            WriteAuditLog(state, "System Administrator", "EMAIL_BROADCAST", targetLabel, $"Dispatched '{dto.Subject}' to {resolvedEmails.Count} recipients.");
            SaveState(state);

            var htmlBody = $@"
                <div style='font-family:Segoe UI,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;'>
                    <span style='background:#dbeafe;color:#1d4ed8;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:bold;'>{dto.Category} • {targetLabel}</span>
                    <h2 style='color:#0f172a;margin-top:12px;'>{dto.Subject}</h2>
                    <p style='color:#334155;line-height:1.6;white-space:pre-line;'>{dto.Body}</p>
                    <hr style='border:none;border-top:1px solid #e2e8f0;margin:20px 0;' />
                    <small style='color:#64748b;'>Unit University Academic Affairs Office</small>
                </div>";

            int emailsSent = await DispatchEmailsAsync(resolvedEmails, $"[Unit University] {dto.Subject}", htmlBody);
            return Ok(new { emailsSent, totalTargets = resolvedEmails.Count, targetLabel });
        }

        [HttpPost("tickets")]
        public async Task<IActionResult> CreateSupportTicket([FromBody] SupportTicketDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Subject) || string.IsNullOrWhiteSpace(dto.Description))
                return BadRequest(new { message = "Please enter subject and description." });

            var state = LoadState();
            dto.Id = "REQ-" + DateTime.Now.ToString("MMdd-HHmmss");
            dto.Status = "Pending";
            dto.CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            state.Tickets.Insert(0, dto);
            WriteAuditLog(state, $"{dto.StudentName} ({dto.StudentId})", "SUPPORT_TICKET", dto.Id, $"Opened helpdesk ticket: {dto.Subject}");
            SaveState(state);

            var adminEmail = state.Accounts.FirstOrDefault(a => a.Role == "Admin")?.Email ?? "admin@unit.edu.vn";
            await DispatchEmailsAsync(
                new[] { adminEmail },
                $"[Student Support • {dto.Id}] {dto.StudentName} ({dto.StudentId}) - {dto.Category}",
                $"<h3>New Student Support Request</h3><p><strong>Student:</strong> {dto.StudentName} ({dto.StudentId} - {dto.StudentEmail})</p><p><strong>Category:</strong> {dto.Category}</p><p><strong>Subject:</strong> {dto.Subject}</p><p>{dto.Description}</p>"
            );

            return Ok(dto);
        }

        [HttpPost("admin/reply-ticket")]
        public async Task<IActionResult> ReplySupportTicket([FromBody] TicketReplyDto dto)
        {
            var state = LoadState();
            var ticket = state.Tickets.FirstOrDefault(t => t.Id == dto.TicketId);
            if (ticket == null) return NotFound();

            ticket.Status = string.IsNullOrWhiteSpace(dto.Status) ? "Resolved" : dto.Status;
            ticket.AdminReply = dto.AdminReply;
            ticket.UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm");

            state.Announcements.Insert(0, new AnnouncementDto
            {
                Id = "SUP-" + DateTime.Now.ToString("HHmmss"),
                Category = "Support Reply",
                TargetGroup = ticket.StudentEmail,
                Title = $"Support Update ({ticket.Id}): {ticket.Subject}",
                Message = $"Status: {ticket.Status} — Admin Response: {ticket.AdminReply}",
                CreatedAt = ticket.UpdatedAt
            });

            WriteAuditLog(state, "System Administrator", "SUPPORT_REPLY", ticket.Id, $"Marked {ticket.Id} as {ticket.Status} and replied to {ticket.StudentEmail}.");
            SaveState(state);

            await DispatchEmailsAsync(
                new[] { ticket.StudentEmail },
                $"[Unit University Support • {ticket.Id}] Response to your request",
                $"<h3>Hello {ticket.StudentName},</h3><p>Your support request <strong>{ticket.Id} ({ticket.Subject})</strong> has been updated to <strong>{ticket.Status}</strong>.</p><p><strong>Academic Office Response:</strong><br>{ticket.AdminReply}</p>"
            );

            return Ok(ticket);
        }

        [HttpPost("assignments")]
        public IActionResult CreateAssignment([FromBody] AssignmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.ClassId))
                return BadRequest(new { message = "Class and Title are required." });

            var state = LoadState();
            dto.Id = "ASM-" + DateTime.Now.ToString("MMdd-HHmmss");
            dto.CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            state.Assignments.Insert(0, dto);

            state.Announcements.Insert(0, new AnnouncementDto
            {
                Id = "NOTIF-" + DateTime.Now.ToString("HHmmss"),
                Category = "Assignment",
                TargetGroup = $"Class {dto.ClassId}",
                TargetClassIds = new List<string> { dto.ClassId },
                Title = $"New Assignment ({dto.ClassId}): {dto.Title}",
                Message = $"Lecturer {dto.LecturerName} posted a new assignment. Deadline: {dto.DueDate}.",
                CreatedAt = dto.CreatedAt
            });

            WriteAuditLog(state, dto.LecturerName, "ASSIGNMENT_POST", dto.ClassId, $"Published assignment '{dto.Title}' (Due: {dto.DueDate}).");
            SaveState(state);
            return Ok(dto);
        }

        [HttpPost("assignments/{assignmentId}/submit")]
        public IActionResult SubmitAssignment(string assignmentId, [FromBody] SubmissionDto sub)
        {
            var state = LoadState();
            var asm = state.Assignments.FirstOrDefault(a => a.Id == assignmentId);
            if (asm == null) return NotFound();

            sub.SubmittedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            var existing = asm.Submissions.FirstOrDefault(s => s.StudentId.Equals(sub.StudentId, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
            {
                existing.FileName = sub.FileName;
                existing.FileDataOrLink = sub.FileDataOrLink;
                existing.Note = sub.Note;
                existing.SubmittedAt = sub.SubmittedAt;
            }
            else
            {
                asm.Submissions.Insert(0, sub);
            }

            WriteAuditLog(state, $"{sub.StudentName} ({sub.StudentId})", "ASSIGNMENT_SUBMIT", asm.Id, $"Submitted '{sub.FileName}' for {asm.Title}.");
            SaveState(state);
            return Ok(asm);
        }

        [HttpPost("assignments/grade")]
        public IActionResult GradeAssignmentSubmission([FromBody] GradeSubmissionDto dto)
        {
            var state = LoadState();
            var asm = state.Assignments.FirstOrDefault(a => a.Id == dto.AssignmentId);
            var sub = asm?.Submissions.FirstOrDefault(s => s.StudentId.Equals(dto.StudentId, StringComparison.OrdinalIgnoreCase));
            if (asm == null || sub == null) return NotFound();

            double? oldScore = sub.Score;
            sub.Score = dto.Score;
            sub.Feedback = dto.Feedback;

            state.Announcements.Insert(0, new AnnouncementDto
            {
                Id = "GRD-" + DateTime.Now.ToString("HHmmss"),
                Category = "Grade Published",
                TargetGroup = sub.StudentEmail,
                Title = $"Assignment Graded: {asm.Title}",
                Message = $"Score: {dto.Score}/10 — Lecturer Feedback: {dto.Feedback}",
                CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm")
            });

            WriteAuditLog(state, asm.LecturerName, "GRADE_UPDATE", $"{sub.StudentId} ({asm.Id})", $"Graded {sub.StudentName}: {(oldScore.HasValue ? oldScore.Value.ToString("0.0") : "None")} -> {dto.Score:0.0}/10.");
            SaveState(state);
            return Ok(sub);
        }

        [HttpPost("attendance/save")]
        public IActionResult SaveClassAttendance([FromBody] List<AttendanceSummaryDto> records)
        {
            if (records == null || records.Count == 0) return BadRequest();
            var state = LoadState();
            int bannedCount = 0;

            foreach (var r in records)
            {
                r.UpdatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
                double rate = r.TotalSessions > 0 ? (double)r.AttendedSessions / r.TotalSessions * 100.0 : 100.0;
                if (rate < 80.0) bannedCount++;

                var existing = state.AttendanceRecords.FirstOrDefault(x => x.StudentId == r.StudentId && x.ClassId == r.ClassId);
                if (existing != null)
                {
                    existing.TotalSessions = r.TotalSessions;
                    existing.AttendedSessions = r.AttendedSessions;
                    existing.AbsentSessions = r.AbsentSessions;
                    existing.UpdatedBy = r.UpdatedBy;
                    existing.UpdatedAt = r.UpdatedAt;
                }
                else
                {
                    state.AttendanceRecords.Add(r);
                }
            }

            string clsId = records[0].ClassId;
            string actor = string.IsNullOrWhiteSpace(records[0].UpdatedBy) ? "Lecturer" : records[0].UpdatedBy;
            WriteAuditLog(state, actor, "ATTENDANCE_LOCK", $"Class {clsId}", $"Synced attendance for {records.Count} students ({bannedCount} flagged Ineligible for Exam < 80%).");

            SaveState(state);
            return Ok(new { saved = records.Count, bannedCount });
        }

        [HttpPost("admin/evaluate-scholarships")]
        public IActionResult EvaluateScholarships()
        {
            var state = LoadState();
            state.Scholarships.Clear();

            foreach (var s in state.Students.OrderByDescending(x => x.Gpa))
            {
                if (s.Gpa >= 3.90)
                {
                    state.Scholarships.Add(new ScholarshipAwardDto
                    {
                        StudentId = s.Id,
                        StudentName = s.FullName,
                        Major = s.Major,
                        ClassId = s.ClassId,
                        Gpa = s.Gpa,
                        Tier = "Full Presidential (100%)",
                        WaiverAmountVnd = 12500000
                    });
                }
                else if (s.Gpa >= 3.78)
                {
                    state.Scholarships.Add(new ScholarshipAwardDto
                    {
                        StudentId = s.Id,
                        StudentName = s.FullName,
                        Major = s.Major,
                        ClassId = s.ClassId,
                        Gpa = s.Gpa,
                        Tier = "Merit Excellence (50%)",
                        WaiverAmountVnd = 6250000
                    });
                }
                else if (s.Gpa >= 3.65)
                {
                    state.Scholarships.Add(new ScholarshipAwardDto
                    {
                        StudentId = s.Id,
                        StudentName = s.FullName,
                        Major = s.Major,
                        ClassId = s.ClassId,
                        Gpa = s.Gpa,
                        Tier = "Dean's Honor List (30%)",
                        WaiverAmountVnd = 3750000
                    });
                }
            }

            WriteAuditLog(state, "System Administrator", "SCHOLARSHIP_EVAL", "All 3 Faculties", $"Evaluated {state.Students.Count} students; awarded {state.Scholarships.Count} merit scholarships.");
            SaveState(state);
            return Ok(new { totalAwarded = state.Scholarships.Count, scholarships = state.Scholarships });
        }

        [HttpPost("events")]
        public IActionResult CreateCampusEvent([FromBody] CampusEventDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest();
            var state = LoadState();
            dto.Id = "EVT-" + DateTime.Now.ToString("MMdd-HHmm");
            state.Events.Insert(0, dto);
            WriteAuditLog(state, "System Administrator", "EVENT_CREATE", dto.Id, $"Created campus event '{dto.Title}' (+{dto.ConductPoints} conduct points).");
            SaveState(state);
            return Ok(dto);
        }

        [HttpPost("events/{eventId}/checkin")]
        public IActionResult CheckInCampusEvent(string eventId, [FromBody] EventAttendeeDto attendee)
        {
            var state = LoadState();
            var evt = state.Events.FirstOrDefault(e => e.Id == eventId);
            if (evt == null) return NotFound();

            if (evt.Attendees.Any(a => a.StudentId.Equals(attendee.StudentId, StringComparison.OrdinalIgnoreCase)))
                return BadRequest(new { message = "You have already checked in for this event!" });

            attendee.CheckedInAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            attendee.PointsEarned = evt.ConductPoints;
            evt.Attendees.Insert(0, attendee);

            WriteAuditLog(state, $"{attendee.StudentName} ({attendee.StudentId})", "EVENT_CHECKIN", evt.Id, $"Checked in to '{evt.Title}' (+{evt.ConductPoints} conduct points).");
            SaveState(state);
            return Ok(evt);
        }

        [HttpPost("pay/{invoiceId}")]
        public IActionResult PayInvoice(string invoiceId)
        {
            var state = LoadState();
            var inv = state.Invoices.FirstOrDefault(i => i.Id == invoiceId);
            if (inv == null) return NotFound();
            inv.Paid = true;
            WriteAuditLog(state, "Student Portal", "TUITION_PAID", invoiceId, $"Confirmed VietQR payment for invoice {invoiceId} ({inv.AmountVnd:N0} VND).");
            SaveState(state);
            return Ok(inv);
        }
    }
}