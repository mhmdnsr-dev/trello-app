import { connect } from 'mongoose';

const dbConnection = async uri => await connect(uri);

export default dbConnection;
