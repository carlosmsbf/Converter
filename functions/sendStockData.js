exports.handler = async (event, context) => {
  try {

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    };
    return response;
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
