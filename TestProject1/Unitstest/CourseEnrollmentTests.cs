using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace StudentManagement.Tests.Unitstest
{
    public class CourseEnrollmentTests
    {
        private sealed record CourseItem(string CourseId, string Title, int Credits);

        private static readonly List<CourseItem> Catalog = new()
        {
            new("C101", "Programming Fundamentals", 3),
            new("C102", "Database Systems", 4),
            new("C103", "Web Application Development", 4)
        };

        // TC017: Đăng ký môn học tồn tại thành công
        [Fact]
        public void EnrollCourse_ExistingCourse_ReturnsTrue()
        {
            var enrolled = new List<(string StudentId, string CourseId)>();

            bool result = TryEnrollStudent("S001", "C101", Catalog, enrolled);

            Assert.True(result);
            Assert.Single(enrolled);
        }

        // TC018: Đăng ký môn học không tồn tại trả về false và không đổi dữ liệu
        [Fact]
        public void EnrollCourse_NonExistentCourse_ReturnsFalseWithoutModifyingData()
        {
            var enrolled = new List<(string StudentId, string CourseId)>();

            bool result = TryEnrollStudent("S001", "C999", Catalog, enrolled);

            Assert.False(result);
            Assert.Empty(enrolled);
        }

        // TC019: Lấy toàn bộ danh sách môn học
        [Fact]
        public void GetCourses_ReturnsAllCatalogCourses()
        {
            var courses = GetAllCourses(Catalog);

            Assert.Equal(3, courses.Count);
            Assert.Contains(courses, c => c.CourseId == "C102");
        }

        private static bool TryEnrollStudent(
            string studentId,
            string courseId,
            IReadOnlyList<CourseItem> courses,
            ICollection<(string StudentId, string CourseId)> enrollments)
        {
            if (string.IsNullOrWhiteSpace(studentId) || string.IsNullOrWhiteSpace(courseId))
                return false;

            bool exists = courses.Any(c => c.CourseId == courseId);
            if (!exists)
                return false;

            enrollments.Add((studentId, courseId));
            return true;
        }

        private static IReadOnlyList<CourseItem> GetAllCourses(IReadOnlyList<CourseItem> courses)
            => courses;
    }
}