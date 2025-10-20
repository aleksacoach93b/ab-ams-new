export default function TestPage() {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#111827', marginBottom: '20px' }}>
        AB - AMS Test Page
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        If you can see this page, the build was successful!
      </p>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: '#111827', marginBottom: '10px' }}>
          Build Status: ✅ SUCCESS
        </h2>
        <p style={{ color: '#059669' }}>
          All dependencies are working correctly!
        </p>
      </div>
    </div>
  )
}
