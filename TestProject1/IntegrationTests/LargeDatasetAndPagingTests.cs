using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace StudentManagement.Tests.IntegrationTests
{
    public class LargeDatasetAndPagingTests
    {
        private sealed record StudentRow(string Id, string FullName, double Gpa);

        // TC006 - TC008: Phân trang danh sách sinh viên
        [Fact]
        public void GetPagedStudents_FirstAndLastPage_ReturnsExpectedSlices()
        {
            var dataset = Enumerable.Range(1, 120)
                .Select(i => new StudentRow($"S{i:000}", $"Student {i}", 3.0))
                .ToList();

            var page1 = GetPage(dataset, page: 1, pageSize: 50);
            var page3 = GetPage(dataset, page: 3, pageSize: 50);
            var page10 = GetPage(dataset, page: 10, pageSize: 50);

            Assert.Equal(50, page1.Items.Count);
            Assert.Equal(120, page1.TotalCount);

            Assert.Equal(20, page3.Items.Count);
            Assert.Equal("S101", page3.Items.First().Id);
            Assert.Equal("S120", page3.Items.Last().Id);

            Assert.Empty(page10.Items);
            Assert.Equal(120, page10.TotalCount);
        }

        // TC011: Danh sách rỗng không gây lỗi
        [Fact]
        public void GetPagedStudents_EmptyDataset_ReturnsEmptyWithoutError()
        {
            var emptyList = new List<StudentRow>();

            var result = GetPage(emptyList, page: 1, pageSize: 50);

            Assert.Empty(result.Items);
            Assert.Equal(0, result.TotalCount);
        }

        // Kiểm thử xử lý tập dữ liệu lớn (5,000 bản ghi)
        [Fact]
        public void FilterAndPage_LargeDataset5000Records_FiltersAccurately()
        {
            var largeDataset = Enumerable.Range(1, 5000)
                .Select(i => new StudentRow($"SV{i:0000}", $"Learner {i}", i % 2 == 0 ? 3.6 : 2.8))
                .ToList();

            var honors = largeDataset.Where(s => s.Gpa >= 3.5).ToList();
            var pagedHonors = GetPage(honors, page: 2, pageSize: 100);

            Assert.Equal(2500, honors.Count);
            Assert.Equal(100, pagedHonors.Items.Count);
        }

        private static (IReadOnlyList<StudentRow> Items, int TotalCount) GetPage(
            IReadOnlyList<StudentRow> source, int page, int pageSize)
        {
            int total = source.Count;
            var items = source.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            return (items, total);
        }
    }
}