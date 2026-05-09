param(
    [string]$BaseUrl = 'http://localhost:8000'
)

$ErrorActionPreference = 'Stop'
$baseUrl = $BaseUrl.TrimEnd('/')
$results = [System.Collections.Generic.List[object]]::new()

function Add-Result {
    param(
        [string]$name,
        [string]$method,
        [string]$path,
        [bool]$ok,
        $status,
        [string]$message
    )

    $results.Add([pscustomobject]@{
        Name = $name
        Method = $method
        Path = $path
        Ok = $ok
        Status = $status
        Message = $message
    }) | Out-Null
}

function Invoke-Api {
    param(
        [string]$name,
        [string]$method,
        [string]$path,
        $body = $null,
        [string]$token = $null
    )

    $headers = @{}
    if ($token) {
        $headers['Authorization'] = "Bearer $token"
    }

    try {
        $params = @{
            Uri = "$baseUrl$path"
            Method = $method
            Headers = $headers
            ErrorAction = 'Stop'
        }

        # Prevent interactive Script Execution Risk prompts in Windows PowerShell.
        if ($PSVersionTable.PSVersion.Major -lt 6) {
            $params['UseBasicParsing'] = $true
        }

        if ($null -ne $body) {
            $params['ContentType'] = 'application/json'
            $params['Body'] = ($body | ConvertTo-Json -Depth 10)
        }

        $response = Invoke-WebRequest @params
        $data = $null
        if ($response.Content) {
            try {
                $data = $response.Content | ConvertFrom-Json
            }
            catch {
                $data = $response.Content
            }
        }

        Add-Result $name $method $path $true ([int]$response.StatusCode) 'ok'
        return @{ Ok = $true; Data = $data }
    }
    catch {
        $status = '-'
        $detail = $_.Exception.Message

        if ($_.Exception.Response) {
            try {
                $status = [int]$_.Exception.Response.StatusCode
            }
            catch {
            }

            try {
                $stream = $_.Exception.Response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $rawBody = $reader.ReadToEnd()
                    if ($rawBody) {
                        $detail = $rawBody
                    }
                }
            }
            catch {
            }
        }

        $detail = ($detail -replace "\r|\n", ' ')
        Add-Result $name $method $path $false $status $detail
        return @{ Ok = $false; Data = $null }
    }
}

$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

$adminLogin = Invoke-Api 'Login Admin' 'POST' '/api/auth/login/' @{ username = 'admin_demo'; password = 'Admin@123' }
$teacherLogin = Invoke-Api 'Login Teacher' 'POST' '/api/auth/login/' @{ username = 'teacher_demo'; password = 'Teacher@123' }
$studentLogin = Invoke-Api 'Login Student' 'POST' '/api/auth/login/' @{ username = 'student_demo'; password = 'Student@123' }

$adminToken = if ($adminLogin.Ok) { $adminLogin.Data.access } else { $null }
$teacherToken = if ($teacherLogin.Ok) { $teacherLogin.Data.access } else { $null }
$studentToken = if ($studentLogin.Ok) { $studentLogin.Data.access } else { $null }

if ($teacherToken) {
    Invoke-Api 'Teacher List Courses' 'GET' '/api/teacher/courses/' $null $teacherToken | Out-Null

    $teacherCreate = Invoke-Api 'Teacher Create Course' 'POST' '/api/teacher/courses/' @{
        title = "Live Test Teacher $stamp"
        description = 'connectivity check'
    } $teacherToken

    if ($teacherCreate.Ok -and $teacherCreate.Data.id) {
        $teacherCourseId = $teacherCreate.Data.id
        Invoke-Api 'Teacher Update Course' 'PUT' "/api/teacher/courses/$teacherCourseId/" @{
            title = "Live Test Teacher Updated $stamp"
            description = 'updated'
        } $teacherToken | Out-Null

        Invoke-Api 'Teacher Delete Course' 'DELETE' "/api/teacher/courses/$teacherCourseId/" $null $teacherToken | Out-Null
    }
    else {
        Add-Result 'Teacher Update Course' 'PUT' '/api/teacher/courses/{id}/' $false '-' 'Skipped: teacher create failed'
        Add-Result 'Teacher Delete Course' 'DELETE' '/api/teacher/courses/{id}/' $false '-' 'Skipped: teacher create failed'
    }
}
else {
    Add-Result 'Teacher List Courses' 'GET' '/api/teacher/courses/' $false '-' 'Skipped: teacher login failed'
    Add-Result 'Teacher Create Course' 'POST' '/api/teacher/courses/' $false '-' 'Skipped: teacher login failed'
    Add-Result 'Teacher Update Course' 'PUT' '/api/teacher/courses/{id}/' $false '-' 'Skipped: teacher login failed'
    Add-Result 'Teacher Delete Course' 'DELETE' '/api/teacher/courses/{id}/' $false '-' 'Skipped: teacher login failed'
}

if ($adminToken) {
    Invoke-Api 'Admin List Courses' 'GET' '/api/admin/courses/' $null $adminToken | Out-Null

    $adminCreateCourse = Invoke-Api 'Admin Create Course' 'POST' '/api/admin/courses/' @{
        title = "Live Test Admin $stamp"
        description = 'connectivity check'
    } $adminToken

    if ($adminCreateCourse.Ok -and $adminCreateCourse.Data.id) {
        $adminCourseId = $adminCreateCourse.Data.id
        Invoke-Api 'Admin Update Course' 'PUT' "/api/admin/courses/$adminCourseId/" @{
            title = "Live Test Admin Updated $stamp"
            description = 'updated'
        } $adminToken | Out-Null

        Invoke-Api 'Admin Delete Course' 'DELETE' "/api/admin/courses/$adminCourseId/" $null $adminToken | Out-Null
    }
    else {
        Add-Result 'Admin Update Course' 'PUT' '/api/admin/courses/{id}/' $false '-' 'Skipped: admin create failed'
        Add-Result 'Admin Delete Course' 'DELETE' '/api/admin/courses/{id}/' $false '-' 'Skipped: admin create failed'
    }

    $username = "live_test_user_$stamp"
    $adminCreateUser = Invoke-Api 'Admin Create User' 'POST' '/api/admin/users/' @{
        username = $username
        password = 'TempPass@123'
        role = 'student'
        email = "$username@test.com"
    } $adminToken

    if ($adminCreateUser.Ok -and $adminCreateUser.Data.id) {
        $adminUserId = $adminCreateUser.Data.id
        Invoke-Api 'Admin Update User' 'PUT' "/api/admin/users/$adminUserId/" @{
            username = "${username}_u"
            role = 'student'
            email = "${username}_u@test.com"
        } $adminToken | Out-Null

        Invoke-Api 'Admin Delete User' 'DELETE' "/api/admin/users/$adminUserId/" $null $adminToken | Out-Null
    }
    else {
        Add-Result 'Admin Update User' 'PUT' '/api/admin/users/{id}/' $false '-' 'Skipped: admin user create failed'
        Add-Result 'Admin Delete User' 'DELETE' '/api/admin/users/{id}/' $false '-' 'Skipped: admin user create failed'
    }
}
else {
    Add-Result 'Admin List Courses' 'GET' '/api/admin/courses/' $false '-' 'Skipped: admin login failed'
    Add-Result 'Admin Create Course' 'POST' '/api/admin/courses/' $false '-' 'Skipped: admin login failed'
    Add-Result 'Admin Update Course' 'PUT' '/api/admin/courses/{id}/' $false '-' 'Skipped: admin login failed'
    Add-Result 'Admin Delete Course' 'DELETE' '/api/admin/courses/{id}/' $false '-' 'Skipped: admin login failed'
    Add-Result 'Admin Create User' 'POST' '/api/admin/users/' $false '-' 'Skipped: admin login failed'
    Add-Result 'Admin Update User' 'PUT' '/api/admin/users/{id}/' $false '-' 'Skipped: admin login failed'
    Add-Result 'Admin Delete User' 'DELETE' '/api/admin/users/{id}/' $false '-' 'Skipped: admin login failed'
}

if ($studentToken) {
    $studentCourses = Invoke-Api 'Student List Courses' 'GET' '/api/student/courses/' $null $studentToken
    $enrollCourseId = $null

    if ($studentCourses.Ok -and $studentCourses.Data -and $studentCourses.Data.Count -gt 0 -and $studentCourses.Data[0].id) {
        $enrollCourseId = $studentCourses.Data[0].id
    }

    if (-not $enrollCourseId -and $teacherToken) {
        $tempCourse = Invoke-Api 'Temp Course For Enrollment' 'POST' '/api/teacher/courses/' @{
            title = "Temp Enroll $stamp"
            description = 'temporary'
        } $teacherToken

        if ($tempCourse.Ok -and $tempCourse.Data.id) {
            $enrollCourseId = $tempCourse.Data.id
        }
    }

    if ($enrollCourseId) {
        Invoke-Api 'Student Enroll Course' 'POST' "/api/student/enroll/$enrollCourseId/" $null $studentToken | Out-Null
    }
    else {
        Add-Result 'Student Enroll Course' 'POST' '/api/student/enroll/{courseId}/' $false '-' 'Skipped: no course available to enroll'
    }

    Invoke-Api 'Student Enrolled Courses' 'GET' '/api/student/enrolled-courses/' $null $studentToken | Out-Null

    if ($tempCourse -and $tempCourse.Ok -and $tempCourse.Data.id) {
        $tempCourseId = $tempCourse.Data.id
        Invoke-Api 'Cleanup Temp Course' 'DELETE' "/api/teacher/courses/$tempCourseId/" $null $teacherToken | Out-Null
    }
}
else {
    Add-Result 'Student List Courses' 'GET' '/api/student/courses/' $false '-' 'Skipped: student login failed'
    Add-Result 'Student Enroll Course' 'POST' '/api/student/enroll/{courseId}/' $false '-' 'Skipped: student login failed'
    Add-Result 'Student Enrolled Courses' 'GET' '/api/student/enrolled-courses/' $false '-' 'Skipped: student login failed'
}

$orderedNames = @(
    'Login Admin',
    'Login Teacher',
    'Login Student',
    'Teacher List Courses',
    'Teacher Create Course',
    'Teacher Update Course',
    'Teacher Delete Course',
    'Admin List Courses',
    'Admin Create Course',
    'Admin Update Course',
    'Admin Delete Course',
    'Admin Create User',
    'Admin Update User',
    'Admin Delete User',
    'Student List Courses',
    'Student Enroll Course',
    'Student Enrolled Courses'
)

foreach ($name in $orderedNames) {
    $entry = $results | Where-Object { $_.Name -eq $name } | Select-Object -First 1
    if (-not $entry) {
        Write-Host "[FAIL] $name | - - | status=- | Missing test result"
        continue
    }

    if ($entry.Ok) {
        Write-Host "[PASS] $($entry.Name) | $($entry.Method) $($entry.Path) | status=$($entry.Status)"
    }
    else {
        Write-Host "[FAIL] $($entry.Name) | $($entry.Method) $($entry.Path) | status=$($entry.Status) | $($entry.Message)"
    }
}

$totalPass = ($results | Where-Object { $_.Name -in $orderedNames -and $_.Ok }).Count
$totalFail = ($orderedNames.Count - $totalPass)

Write-Host "TOTAL_PASS=$totalPass"
Write-Host "TOTAL_FAIL=$totalFail"

if ($totalFail -gt 0) {
    exit 1
}

exit 0
