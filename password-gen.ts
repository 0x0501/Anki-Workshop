import bcrypt from 'bcryptjs';
const hash = bcrypt.hashSync('bacon', 10);


const result = bcrypt.compareSync(
	'bacon',
	'$2b$10$qHszTIv.jDluFa7I9M1D5uJ5hRgt3EJqHqp8nCcl3PfnMiOu//Ku6'
);

console.log(hash);
console.log(result);
