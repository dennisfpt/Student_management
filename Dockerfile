FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["StudentManagement.API/StudentManagement.API.csproj", "StudentManagement.API/"]
COPY ["StudentManagement.Application/StudentManagement.Application.csproj", "StudentManagement.Application/"]
COPY ["StudentManagement.Domain/StudentManagement.Domain.csproj", "StudentManagement.Domain/"]
COPY ["StudentManagement.Infrastructure/StudentManagement.Infrastructure.csproj", "StudentManagement.Infrastructure/"]

RUN dotnet restore "StudentManagement.API/StudentManagement.API.csproj"

COPY . .
WORKDIR "/src/StudentManagement.API"
RUN dotnet publish "StudentManagement.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "StudentManagement.API.dll"]