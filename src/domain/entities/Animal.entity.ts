type updateParams = {
  name: string;
};

class Animal {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
  sayHello() {
    console.log(`Hello ${this.name}`);
  }
  updateName(params: updateParams) {
    new Animal(this.id, params.name);
  }
}
const bobby = new Animal("123", "Bobby");

bobby.updateName({ name: "bob" });

console.log(bobby.sayHello());
