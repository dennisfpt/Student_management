using System.Globalization;
using StudentManagement.Domain.Entities;
using StudentManagement.Domain.Interfaces;

namespace StudentManagement.Infrastructure.Repositories
{
    public class CsvStudentRepository : IStudentRepository
    {
        private readonly string _filePath;

        public CsvStudentRepository(string filePath = "students.csv")
        {
            _filePath = filePath;

            if (!File.Exists(_filePath))
            {
                File.WriteAllText(_filePath, "Id,FullName,Email,DateOfBirth,Gpa" + Environment.NewLine);
            }
        }

        public async Task AddAsync(Student student)
        {
            var line = $"{student.Id},{student.FullName},{student.Email},{student.DateOfBirth:yyyy-MM-dd},{student.Gpa.ToString(CultureInfo.InvariantCulture)}";
            await File.AppendAllLinesAsync(_filePath, new[] { line });
        }

        public async Task<Student?> GetByIdAsync(string id)
        {
            if (!File.Exists(_filePath)) return null;

            var lines = await File.ReadAllLinesAsync(_filePath);
            foreach (var line in lines.Skip(1))
            {
                var parts = line.Split(',');
                if (parts.Length >= 5 && parts[0] == id)
                {
                    return ParseStudent(parts);
                }
            }

            return null;
        }

        public async Task<IEnumerable<Student>> GetPageAsync(int page, int size)
        {
            var list = new List<Student>();
            if (!File.Exists(_filePath)) return list;

            var lines = await File.ReadAllLinesAsync(_filePath);
            var students = lines.Skip(1)
                                .Select(line => ParseStudent(line.Split(',')))
                                .Where(s => s != null)
                                .Cast<Student>();

            return students.Skip((page - 1) * size).Take(size).ToList();
        }

        public async IAsyncEnumerable<Student> StreamAllAsync()
        {
            if (!File.Exists(_filePath)) yield break;

            using var reader = new StreamReader(_filePath);
            await reader.ReadLineAsync();

            string? line;
            while ((line = await reader.ReadLineAsync()) != null)
            {
                var parts = line.Split(',');
                var student = ParseStudent(parts);
                if (student != null)
                {
                    yield return student;
                }
            }
        }

        public async Task<bool> UpdateAsync(Student student)
        {
            if (!File.Exists(_filePath)) return false;

            var lines = (await File.ReadAllLinesAsync(_filePath)).ToList();
            var index = lines.FindIndex(1, line => line.Split(',')[0] == student.Id);

            if (index == -1) return false;

            lines[index] = $"{student.Id},{student.FullName},{student.Email},{student.DateOfBirth:yyyy-MM-dd},{student.Gpa.ToString(CultureInfo.InvariantCulture)}";
            await File.WriteAllLinesAsync(_filePath, lines);
            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (!File.Exists(_filePath)) return false;

            var lines = (await File.ReadAllLinesAsync(_filePath)).ToList();
            var index = lines.FindIndex(1, line => line.Split(',')[0] == id);

            if (index == -1) return false;

            lines.RemoveAt(index);
            await File.WriteAllLinesAsync(_filePath, lines);
            return true;
        }

        private static Student? ParseStudent(string[] parts)
        {
            if (parts.Length < 5) return null;

            return new Student
            {
                Id = parts[0],
                FullName = parts[1],
                Email = parts[2],
                DateOfBirth = DateTime.TryParse(parts[3], out var dob) ? dob : DateTime.MinValue,
                Gpa = double.TryParse(parts[4], NumberStyles.Any, CultureInfo.InvariantCulture, out var gpa) ? gpa : 0.0
            };
        }
    }
}