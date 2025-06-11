async function getVideos() {
  try {
    const response = await fetch(`http://localhost:5000/`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log(error.message);
  }
}
